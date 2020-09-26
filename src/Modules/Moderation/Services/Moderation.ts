import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message, TextChannel } from 'eris';
import { Punishment, BasePunishment } from '../../../Entity/Punishment';
import { Violation } from '../../../Misc/Enums/Violation';
import { BaseMember } from '../../../Entity/Member';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { Images } from '../../../Misc/Enums/Images';

import moment from 'moment';
import i18n from 'i18n';
import { DISCORD_EMOJI_REGEX, EMOJIS_REGEX } from '../../../Misc/Regex/Emoji';

interface Arguments {
	guild: Guild;
	settings: BaseSettings;
}

interface MiniMessage {
	id: string;
	author: string;
	createdAt: number;
	content: string;
	mentions: number;
	roleMentions: number;
}

type WarnFunctions = {
	[key in Violation]: (message: Message, args: Arguments) => Promise<boolean>;
};

type PunishmentFunctions = {
	[key in Punishment]: (member: Member, amount: number, args: Arguments) => Promise<boolean>;
};

export class ModerationService extends BaseService {
	private messageCache: Map<string, MiniMessage[]> = new Map();
	public getMessageCacheSize() {
		return this.messageCache.size;
	}

	private warnFunctions: WarnFunctions = {
		[Violation.invites]: this.invites.bind(this),
		[Violation.allCaps]: this.allCaps.bind(this),
		[Violation.duplicateText]: this.duplicateText.bind(this),
		[Violation.zalgo]: this.zalgoDetect.bind(this),
		[Violation.emojis]: this.emojis.bind(this),
		[Violation.externalLinks]: this.externalLinks.bind(this),
		[Violation.mentions]: this.mentions.bind(this)
	};

	private punishmentFunctions: PunishmentFunctions = {
		[Punishment.BAN]: this.ban.bind(this),
		[Punishment.KICK]: this.kick.bind(this),
		[Punishment.SOFTBAN]: this.softban.bind(this),
		[Punishment.IGNORE]: this.warn.bind(this),
		[Punishment.MUTE]: this.mute.bind(this)
	};

	public async init() {
		const scanMessageCache = () => {
			const now = moment();

			this.messageCache.forEach((value, key) => {
				this.messageCache.set(
					key,
					value.filter((m) => now.diff(m.createdAt, 'second') < 60)
				);
			});
		};

		setInterval(scanMessageCache, 60 * 1000);

		this.client.on('messageCreate', this.onMessage.bind(this));
	}

	private getMiniMessage(message: Message): MiniMessage {
		return {
			id: message.id,
			author: message.author.id,
			createdAt: message.createdAt,
			content: message.content,
			mentions: message.mentions.length,
			roleMentions: message.roleMentions.length
		};
	}

	private async onMessage(message: Message) {
		if (message.author.bot) return;

		const channel = message.channel as TextChannel;
		const guild = channel.guild;

		if (!guild) return;

		const settings = await this.client.cache.guilds.get(guild);

		if (Object.values(settings.autoMod).every((b) => b === false)) {
			return;
		}

		if (settings.autoModIgnoreChannels.has(message.channel.id)) return;

		if (message.member.roles.some((x) => settings.autoModIgnoreRoles.has(x))) return;

		const cacheKey = `${guild.id}-${message.author.id}`;
		const msgs = this.messageCache.get(cacheKey);

		if (msgs) {
			msgs.push(this.getMiniMessage(message));
			this.messageCache.set(cacheKey, msgs);
		} else {
			this.messageCache.set(cacheKey, [this.getMiniMessage(message)]);
		}

		let allViolations: Violation[] = Object.values(Violation);

		for (const violation of allViolations) {
			if (settings.autoMod[violation] !== true) {
				continue;
			}

			const func = this.warnFunctions[violation];

			if (!func) {
				continue;
			}

			const foundViolation = await func(message, { guild, settings });

			if (!foundViolation) {
				continue;
			}

			message.delete().catch(() => undefined);

			await this.sendReplyAndDelete(message, violation, settings);
			await this.addWarnAndPunish(message, violation, { guild, settings });
			return;
		}
	}

	private async addWarnAndPunish(message: Message, type: Violation, { guild, settings }: Arguments) {
		const member = message.member;
		const person = await BaseMember.get(member);
		const t: TranslateFunc = (phrase, replace) => i18n.__({ locale: settings.locale, phrase }, replace);

		let warnsBefore = person.warns.length;

		if (isNaN(warnsBefore) || !isFinite(warnsBefore)) {
			warnsBefore = 0;
		}

		person.warns.push({
			reason: t(`automod.reasons.${type.toString()}`),
			createdAt: moment().toDate(),
			moderator: this.client.user.id,
			expireAt: moment().add(7, 'd').toDate()
		});

		person.warns = person.warns.filter((x) => moment().isBefore(x.expireAt));
		await person.save();

		const warnsAfter = warnsBefore + 1;

		const punishmentConfigs = await this.client.cache.punishments.get(guild);
		const punishmentConfig = punishmentConfigs.find((c) => c.amount > warnsBefore && c.amount <= warnsAfter);

		if (punishmentConfig) {
			const func = this.punishmentFunctions[punishmentConfig.type];

			if (
				!func &&
				this.isPunishable(
					guild,
					message.member,
					guild.members.get(this.client.user.id),
					guild.members.get(this.client.user.id)
				)
			)
				return;

			const extra = [
				{ name: 'logs.mod.reason', value: 'Automod' },
				{ name: 'logs.mod.channel', value: message.channel.mention },
				{ name: 'logs.mod.message', value: message.content.trim() }
			];

			await BasePunishment.informUser(t, member, punishmentConfig.type, extra);

			const punishmentResult = await func(member, punishmentConfig.amount, { guild, settings });

			if (!punishmentResult) return;

			await BasePunishment.new({
				client: this.client,
				settings,
				member: guild.members.get(this.client.user.id),
				target: member,
				extra,
				opts: {
					type: punishmentConfig.type,
					args: '',
					reason: 'Automod',
					moderator: member.id
				}
			});
		}
	}

	/////////////////////////////////
	/// VIOLATIONS
	/////////////////////////////////

	//#region
	private async invites(message: Message, { settings, guild }: Arguments): Promise<boolean> {
		const regex = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/);
		const hasInviteLink = regex.test(message.content);

		return hasInviteLink;
	}

	private async allCaps(message: Message, { settings, guild }: Arguments): Promise<boolean> {
		const minCharacters = 5;
		const percentageCaps = 0.5;

		if (message.content.length < minCharacters) {
			return false;
		}

		const numUppercase = message.content.length - message.content.replace(/[A-ZА-Я]/g, '').length;
		return numUppercase / message.content.length > percentageCaps;
	}

	private async zalgoDetect(message: Message, { settings }: Arguments): Promise<boolean> {
		const hasZalgo = (txt: string) => /%CC%/g.test(encodeURIComponent(txt));
		return hasZalgo(message.content.trim());
	}

	private async emojis(message: Message, { settings }: Arguments): Promise<boolean> {
		return this.countEmojis(message) >= 5;
	}

	private async duplicateText(message: Message, { settings, guild }: Arguments): Promise<boolean> {
		const timeframe = 60 * 1000;

		let cached = this.messageCache.get(`${guild.id}-${message.author.id}`);

		if (cached.length === 1) {
			return false;
		}

		new Map().keys;

		cached = cached.filter(
			(m) =>
				m.id !== message.id &&
				m.author === message.author.id &&
				m.content.toLowerCase() === message.content.toLowerCase() &&
				moment().diff(m.createdAt, 'second') < timeframe
		);
		return cached.length >= 2;
	}

	private async externalLinks(message: Message, { settings }: Arguments): Promise<boolean> {
		const LINK_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.\w{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
		const matches = message.content.match(LINK_REGEX);
		const hasLinks = matches && matches.length > 0;

		return hasLinks;
	}

	private async mentions(message: Message, { settings }: Arguments): Promise<boolean> {
		return message.mentions.length > 3 || message.roleMentions.length > 2;
	}
	//#endregion

	/////////////////////////////////
	/// PUNISHMENTS
	/////////////////////////////////

	//#region
	private async ban(member: Member, amount: number, { guild, settings }: Arguments) {
		try {
			await member.ban(7, 'automod');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async kick(member: Member, amount: number, { guild, settings }: Arguments) {
		try {
			await member.kick('automod');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async softban(member: Member, amount: number, { guild, settings }: Arguments) {
		try {
			await member.ban(7, 'automod');
			await member.unban('softban');
			return true;
		} catch (error) {
			return false;
		}
	}

	private async warn(member: Member, amount: number, { guild, settings }: Arguments) {
		return true;
	}

	private async mute(member: Member, amount: number, { guild, settings }: Arguments) {
		const mutedRole = settings.mutedRole;
		if (!mutedRole || !guild.roles.has(mutedRole)) {
			return false;
		}

		try {
			await member.addRole(mutedRole, 'AutoMod muted');
			return true;
		} catch (error) {
			return false;
		}
	}
	//#endregion

	/////////////////////////////////
	/// UTILS
	/////////////////////////////////

	//#region
	protected countEmojis(message: Message): number {
		let nofEmojis = 0;

		const matches = message.content.match(EMOJIS_REGEX);

		if (matches) {
			nofEmojis = matches.length;
		}

		const discordEmojiMatches = message.content.match(DISCORD_EMOJI_REGEX);

		if (discordEmojiMatches) {
			nofEmojis += discordEmojiMatches.length;
		}

		return nofEmojis;
	}

	public getHighestRole(guild: Guild, roles: string[]): Role {
		return roles
			.map((role) => guild.roles.get(role))
			.filter((role) => !!role)
			.reduce((prev, role) => (role.position > prev.position ? role : prev), {
				position: -1
			} as Role);
	}

	public getHoistRole(guild: Guild, roles: string[]): Role {
		return roles
			.map((role) => guild.roles.get(role))
			.filter((role) => !!role)
			.reduce((prev, role) => (role.position < prev.position ? role : prev), {
				position: -1
			} as Role);
	}

	public isHigherRole(role: Role, highest?: Role, guild?: Guild, me?: Member) {
		const highestRole = highest || this.getHighestRole(guild, me.roles);

		if (!highestRole) return false;

		return highestRole.position > role.position;
	}

	public editableRoles(guild: Guild, roles: string[], me: Member): Role[] {
		const highestBotRole = this.getHighestRole(guild, me.roles);

		return roles.map((r) => guild.roles.get(r)).filter((r) => !!r && this.isHigherRole(r, highestBotRole));
	}

	public isPunishable(guild: Guild, targetMember: Member, authorMember: Member, me: Member) {
		const highestBotRole = this.getHighestRole(guild, me.roles);
		const highestMemberRole = this.getHighestRole(guild, targetMember.roles);
		const highestAuthorRole = this.getHighestRole(guild, authorMember.roles);

		if (guild.ownerID === authorMember.id) {
			return (
				targetMember.id !== me.user.id &&
				targetMember.id !== authorMember.id &&
				highestBotRole.position > highestMemberRole.position
			);
		}

		return (
			targetMember.id !== guild.ownerID &&
			targetMember.id !== me.user.id &&
			highestBotRole.position > highestMemberRole.position &&
			highestAuthorRole.position > highestMemberRole.position
		);
	}

	private async sendReplyAndDelete(message: Message, type: Violation, settings: BaseSettings) {
		const t: TranslateFunc = (phrase, replace) => i18n.__({ locale: settings.locale, phrase }, replace);

		const reply = await this.client.messages.sendReply(message, {
			color: Color.YELLOW,
			timestamp: null,
			footer: null,
			author: {
				name: t('automod.desc', { type: t(`automod.violations.${type.toString()}`) }),
				icon_url: Images.WARN
			}
		});

		if (reply) {
			setTimeout(() => reply.delete().catch(() => undefined), 15 * 1000);
		}
	}
	//#endregion
}

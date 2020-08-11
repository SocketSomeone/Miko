import moment from 'moment';
import i18n from 'i18n';

import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message, TextChannel, EmbedOptions } from 'eris';
import { Punishment, BasePunishment } from '../../../Entity/Punishment';
import { Violation } from '../../../Misc/Models/Violation';
import { BaseMember } from '../../../Entity/Member';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { BaseSettings } from '../../../Entity/GuildSettings';

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
		// this.client.on('messageUpdate', this.onMessage.bind(this));
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

		if (message.member.permission.has(GuildPermission.ADMINISTRATOR)) return;

		const settings = await this.client.cache.guilds.get(guild.id);

		if (Object.values(settings.autoMod).every((b) => b === false)) {
			return;
		}

		if (
			settings.autoModIgnoreChannels.length >= 1 &&
			settings.autoModIgnoreChannels.some((x) => x === message.channel.id)
		)
			return;

		if (
			settings.autoModIgnoreRoles.length >= 1 &&
			message.member.roles.some((x) => settings.autoModIgnoreRoles.includes(x))
		)
			return;

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

		const punishmentConfigs = await this.client.cache.punishments.get(guild.id);
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

			await BasePunishment.informUser(member, punishmentConfig.type, settings, extra);

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

		/* tslint:disable-next-line:max-line-length */
		const regex = /\u{1F3F4}(?:\u{E0067}\u{E0062}(?:\u{E0065}\u{E006E}\u{E0067}|\u{E0077}\u{E006C}\u{E0073}|\u{E0073}\u{E0063}\u{E0074})\u{E007F}|\u200D\u2620\uFE0F)|\u{1F469}\u200D\u{1F469}\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F468}(?:\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D)?\u{1F468}|[\u{1F468}\u{1F469}]\u200D(?:\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}])|\u{1F466}\u200D\u{1F466}|\u{1F467}\u200D[\u{1F466}\u{1F467}]|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9B0}-\u{1F9B3}])|[\u{1F3FB}-\u{1F3FF}]\u200D[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9B0}-\u{1F9B3}])|\u{1F469}\u200D(?:\u2764\uFE0F\u200D(?:\u{1F48B}\u200D[\u{1F468}\u{1F469}]|[\u{1F468}\u{1F469}])|[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9B0}-\u{1F9B3}])|\u{1F469}\u200D\u{1F466}\u200D\u{1F466}|(?:\u{1F441}\uFE0F\u200D\u{1F5E8}|\u{1F469}[\u{1F3FB}-\u{1F3FF}]\u200D[\u2695\u2696\u2708]|\u{1F468}(?:[\u{1F3FB}-\u{1F3FF}]\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}]\uFE0F|[\u{1F46F}\u{1F93C}\u{1F9DE}\u{1F9DF}])\u200D[\u2640\u2642]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9D6}-\u{1F9DD}](?:[\u{1F3FB}-\u{1F3FF}]\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\u{1F469}\u200D[\u2695\u2696\u2708])\uFE0F|\u{1F469}\u200D\u{1F467}\u200D[\u{1F466}\u{1F467}]|\u{1F469}\u200D\u{1F469}\u200D[\u{1F466}\u{1F467}]|\u{1F468}(?:\u200D(?:[\u{1F468}\u{1F469}]\u200D[\u{1F466}\u{1F467}]|[\u{1F466}\u{1F467}])|[\u{1F3FB}-\u{1F3FF}])|\u{1F3F3}\uFE0F\u200D\u{1F308}|\u{1F469}\u200D\u{1F467}|\u{1F469}[\u{1F3FB}-\u{1F3FF}]\u200D[\u{1F33E}\u{1F373}\u{1F393}\u{1F3A4}\u{1F3A8}\u{1F3EB}\u{1F3ED}\u{1F4BB}\u{1F4BC}\u{1F527}\u{1F52C}\u{1F680}\u{1F692}\u{1F9B0}-\u{1F9B3}]|\u{1F469}\u200D\u{1F466}|\u{1F1F6}\u{1F1E6}|\u{1F1FD}\u{1F1F0}|\u{1F1F4}\u{1F1F2}|\u{1F469}[\u{1F3FB}-\u{1F3FF}]|\u{1F1ED}[\u{1F1F0}\u{1F1F2}\u{1F1F3}\u{1F1F7}\u{1F1F9}\u{1F1FA}]|\u{1F1EC}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EE}\u{1F1F1}-\u{1F1F3}\u{1F1F5}-\u{1F1FA}\u{1F1FC}\u{1F1FE}]|\u{1F1EA}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1ED}\u{1F1F7}-\u{1F1FA}]|\u{1F1E8}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1EE}\u{1F1F0}-\u{1F1F5}\u{1F1F7}\u{1F1FA}-\u{1F1FF}]|\u{1F1F2}[\u{1F1E6}\u{1F1E8}-\u{1F1ED}\u{1F1F0}-\u{1F1FF}]|\u{1F1F3}[\u{1F1E6}\u{1F1E8}\u{1F1EA}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F4}\u{1F1F5}\u{1F1F7}\u{1F1FA}\u{1F1FF}]|\u{1F1FC}[\u{1F1EB}\u{1F1F8}]|\u{1F1FA}[\u{1F1E6}\u{1F1EC}\u{1F1F2}\u{1F1F3}\u{1F1F8}\u{1F1FE}\u{1F1FF}]|\u{1F1F0}[\u{1F1EA}\u{1F1EC}-\u{1F1EE}\u{1F1F2}\u{1F1F3}\u{1F1F5}\u{1F1F7}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|\u{1F1EF}[\u{1F1EA}\u{1F1F2}\u{1F1F4}\u{1F1F5}]|\u{1F1F8}[\u{1F1E6}-\u{1F1EA}\u{1F1EC}-\u{1F1F4}\u{1F1F7}-\u{1F1F9}\u{1F1FB}\u{1F1FD}-\u{1F1FF}]|\u{1F1EE}[\u{1F1E8}-\u{1F1EA}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}]|\u{1F1FF}[\u{1F1E6}\u{1F1F2}\u{1F1FC}]|\u{1F1EB}[\u{1F1EE}-\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1F7}]|\u{1F1F5}[\u{1F1E6}\u{1F1EA}-\u{1F1ED}\u{1F1F0}-\u{1F1F3}\u{1F1F7}-\u{1F1F9}\u{1F1FC}\u{1F1FE}]|\u{1F1E9}[\u{1F1EA}\u{1F1EC}\u{1F1EF}\u{1F1F0}\u{1F1F2}\u{1F1F4}\u{1F1FF}]|\u{1F1F9}[\u{1F1E6}\u{1F1E8}\u{1F1E9}\u{1F1EB}-\u{1F1ED}\u{1F1EF}-\u{1F1F4}\u{1F1F7}\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FF}]|\u{1F1E7}[\u{1F1E6}\u{1F1E7}\u{1F1E9}-\u{1F1EF}\u{1F1F1}-\u{1F1F4}\u{1F1F6}-\u{1F1F9}\u{1F1FB}\u{1F1FC}\u{1F1FE}\u{1F1FF}]|[#\*0-9]\uFE0F\u20E3|\u{1F1F1}[\u{1F1E6}-\u{1F1E8}\u{1F1EE}\u{1F1F0}\u{1F1F7}-\u{1F1FB}\u{1F1FE}]|\u{1F1E6}[\u{1F1E8}-\u{1F1EC}\u{1F1EE}\u{1F1F1}\u{1F1F2}\u{1F1F4}\u{1F1F6}-\u{1F1FA}\u{1F1FC}\u{1F1FD}\u{1F1FF}]|\u{1F1F7}[\u{1F1EA}\u{1F1F4}\u{1F1F8}\u{1F1FA}\u{1F1FC}]|\u{1F1FB}[\u{1F1E6}\u{1F1E8}\u{1F1EA}\u{1F1EC}\u{1F1EE}\u{1F1F3}\u{1F1FA}]|\u{1F1FE}[\u{1F1EA}\u{1F1F9}]|[\u{1F3C3}\u{1F3C4}\u{1F3CA}\u{1F46E}\u{1F471}\u{1F473}\u{1F477}\u{1F481}\u{1F482}\u{1F486}\u{1F487}\u{1F645}-\u{1F647}\u{1F64B}\u{1F64D}\u{1F64E}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F926}\u{1F937}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B8}\u{1F9B9}\u{1F9D6}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]|[\u26F9\u{1F3CB}\u{1F3CC}\u{1F575}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u270A-\u270D\u{1F385}\u{1F3C2}\u{1F3C7}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}\u{1F467}\u{1F470}\u{1F472}\u{1F474}-\u{1F476}\u{1F478}\u{1F47C}\u{1F483}\u{1F485}\u{1F4AA}\u{1F574}\u{1F57A}\u{1F590}\u{1F595}\u{1F596}\u{1F64C}\u{1F64F}\u{1F6C0}\u{1F6CC}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F930}-\u{1F936}\u{1F9B5}\u{1F9B6}\u{1F9D1}-\u{1F9D5}][\u{1F3FB}-\u{1F3FF}]|[\u261D\u26F9\u270A-\u270D\u{1F385}\u{1F3C2}-\u{1F3C4}\u{1F3C7}\u{1F3CA}-\u{1F3CC}\u{1F442}\u{1F443}\u{1F446}-\u{1F450}\u{1F466}-\u{1F469}\u{1F46E}\u{1F470}-\u{1F478}\u{1F47C}\u{1F481}-\u{1F483}\u{1F485}-\u{1F487}\u{1F4AA}\u{1F574}\u{1F575}\u{1F57A}\u{1F590}\u{1F595}\u{1F596}\u{1F645}-\u{1F647}\u{1F64B}-\u{1F64F}\u{1F6A3}\u{1F6B4}-\u{1F6B6}\u{1F6C0}\u{1F6CC}\u{1F918}-\u{1F91C}\u{1F91E}\u{1F91F}\u{1F926}\u{1F930}-\u{1F939}\u{1F93D}\u{1F93E}\u{1F9B5}\u{1F9B6}\u{1F9B8}\u{1F9B9}\u{1F9D1}-\u{1F9DD}][\u{1F3FB}-\u{1F3FF}]?|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55\u{1F004}\u{1F0CF}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F236}\u{1F238}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F320}\u{1F32D}-\u{1F335}\u{1F337}-\u{1F37C}\u{1F37E}-\u{1F393}\u{1F3A0}-\u{1F3CA}\u{1F3CF}-\u{1F3D3}\u{1F3E0}-\u{1F3F0}\u{1F3F4}\u{1F3F8}-\u{1F43E}\u{1F440}\u{1F442}-\u{1F4FC}\u{1F4FF}-\u{1F53D}\u{1F54B}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F57A}\u{1F595}\u{1F596}\u{1F5A4}\u{1F5FB}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CC}\u{1F6D0}-\u{1F6D2}\u{1F6EB}\u{1F6EC}\u{1F6F4}-\u{1F6F9}\u{1F910}-\u{1F93A}\u{1F93C}-\u{1F93E}\u{1F940}-\u{1F945}\u{1F947}-\u{1F970}\u{1F973}-\u{1F976}\u{1F97A}\u{1F97C}-\u{1F9A2}\u{1F9B0}-\u{1F9B9}\u{1F9C0}-\u{1F9C2}\u{1F9D0}-\u{1F9FF}]|[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299\u{1F004}\u{1F0CF}\u{1F170}\u{1F171}\u{1F17E}\u{1F17F}\u{1F18E}\u{1F191}-\u{1F19A}\u{1F1E6}-\u{1F1FF}\u{1F201}\u{1F202}\u{1F21A}\u{1F22F}\u{1F232}-\u{1F23A}\u{1F250}\u{1F251}\u{1F300}-\u{1F321}\u{1F324}-\u{1F393}\u{1F396}\u{1F397}\u{1F399}-\u{1F39B}\u{1F39E}-\u{1F3F0}\u{1F3F3}-\u{1F3F5}\u{1F3F7}-\u{1F4FD}\u{1F4FF}-\u{1F53D}\u{1F549}-\u{1F54E}\u{1F550}-\u{1F567}\u{1F56F}\u{1F570}\u{1F573}-\u{1F57A}\u{1F587}\u{1F58A}-\u{1F58D}\u{1F590}\u{1F595}\u{1F596}\u{1F5A4}\u{1F5A5}\u{1F5A8}\u{1F5B1}\u{1F5B2}\u{1F5BC}\u{1F5C2}-\u{1F5C4}\u{1F5D1}-\u{1F5D3}\u{1F5DC}-\u{1F5DE}\u{1F5E1}\u{1F5E3}\u{1F5E8}\u{1F5EF}\u{1F5F3}\u{1F5FA}-\u{1F64F}\u{1F680}-\u{1F6C5}\u{1F6CB}-\u{1F6D2}\u{1F6E0}-\u{1F6E5}\u{1F6E9}\u{1F6EB}\u{1F6EC}\u{1F6F0}\u{1F6F3}-\u{1F6F9}\u{1F910}-\u{1F93A}\u{1F93C}-\u{1F93E}\u{1F940}-\u{1F945}\u{1F947}-\u{1F970}\u{1F973}-\u{1F976}\u{1F97A}\u{1F97C}-\u{1F9A2}\u{1F9B0}-\u{1F9B9}\u{1F9C0}-\u{1F9C2}\u{1F9D0}-\u{1F9FF}]\uFE0F/gu;

		const matches = message.content.match(regex);
		if (matches) {
			nofEmojis = matches.length;
		}

		const discordEmojiRegex = /<a?:.+?:\d+>/g;
		const discordEmojiMatches = message.content.match(discordEmojiRegex);

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

	public isEditableRole(role: Role, highest: Role) {
		return highest.position > role.position;
	}

	public editableRoles(guild: Guild, roles: string[], me: Member): Role[] {
		const highestBotRole = this.getHighestRole(guild, me.roles);

		return roles.map((r) => guild.roles.get(r)).filter((r) => !!r && this.isEditableRole(r, highestBotRole));
	}

	public isPunishable(guild: Guild, targetMember: Member, authorMember: Member, me: Member) {
		const highestBotRole = this.getHighestRole(guild, me.roles);
		const highestMemberRole = this.getHighestRole(guild, targetMember.roles);
		const highestAuthorRole = this.getHighestRole(guild, authorMember.roles);

		if (guild.ownerID === authorMember.id) {
			return (
				targetMember.id !== guild.ownerID &&
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

		const reply = await this.client.messages.sendReply(message, t, {
			color: ColorResolve(Color.DARK),
			title: t('automod.title'),
			description: t('automod.desc', {
				type: t(`automod.violations.${type.toString()}`)
			}),
			footer: {
				text: t('automod.footer'),
				icon_url: this.client.user.dynamicAvatarURL('png', 4096)
			},
			timestamp: new Date().toISOString()
		});

		if (reply) {
			setTimeout(() => reply.delete().catch(() => undefined), 15 * 1000);
		}
	}
	//#endregion
}

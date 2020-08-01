import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message, TextChannel } from 'eris';
import { keyword } from 'chalk';
import { GuildSettings } from '../../../Misc/Models/GuildSetting';
import { Punishment, BasePunishment } from '../../../Entity/Punishment';
import { Violation } from '../../../Misc/Models/Violation';

import moment from 'moment';
import { BaseMember } from '../../../Entity/Member';
interface Arguments {
	guild: Guild;
	settings: GuildSettings;
}

interface MiniMessage {
	id: string;
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
		[Violation.invites]: this.invites.bind(this)
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
		this.client.on('messageUpdate', this.onMessage.bind(this));
	}

	private async onMessage(message: Message) {
		if (message.author.bot) return;

		const channel = message.channel as TextChannel;
		const guild = channel.guild;

		if (!guild) return;

		const settings = await this.client.cache.guilds.get(guild.id);

		// TODO: Checks

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
			const func = this.warnFunctions[violation];

			if (!func) {
				continue;
			}

			const foundViolation = await func(message, { guild, settings });

			if (!foundViolation) {
				continue;
			}

			message.delete().catch(() => undefined);

			//await this.sendReplyAndDelete(message, embed, settings);
			await this.addWarnAndPunish(message, violation, { guild, settings });
			return;
		}
	}

	private async addWarnAndPunish(message: Message, type: Violation, { guild, settings }: Arguments) {
		const member = message.member;
		const person = await BaseMember.get(member);

		let warnsBefore = person.warns.length;

		if (isNaN(warnsBefore) || !isFinite(warnsBefore)) {
			warnsBefore = 0;
		}

		person.warns.push({
			type,
			createdAt: moment().toDate()
		});
		await person.save();

		const warnsAfter = warnsBefore + 1;

		const punishmentConfigs = await this.client.cache.punishments.get(guild.id);
		const punishmentConfig = punishmentConfigs.find((c) => c.amount > warnsBefore && c.amount <= warnsAfter);

		if (punishmentConfig) {
			const func = this.punishmentFunctions[punishmentConfig.type];

			if (!func) {
				return;
			}

			await BasePunishment.informUser(member, punishmentConfig.type, settings, { reason: `Automod: ${type}` });

			const punishmentResult = await func(member, punishmentConfig.amount, { guild, settings });

			if (!punishmentResult) return;

			await BasePunishment.new({
				client: this.client,
				settings,
				member: guild.members.get(this.client.user.id),
				target: member,
				extra: [
					{
						name: 'logs.mod.reason',
						value: 'Automod'
					},
					{
						name: 'logs.mod.channel',
						value: message.channel.mention
					},
					{
						name: 'logs.mod.message',
						value: message.content.trim()
					}
				],
				opts: {
					type: Punishment.BAN,
					amount: 0,
					args: '',
					reason: 'Automod',
					moderator: member.id
				}
			});
		}
	}

	private async invites(message: Message, args: Arguments): Promise<boolean> {
		if (args.settings.autoMod.invites === Punishment.IGNORE) {
			return false;
		}

		const regex = new RegExp(/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/);
		const hasInviteLink = regex.test(message.content);

		return hasInviteLink;
	}

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

	private getMiniMessage(message: Message): MiniMessage {
		return {
			id: message.id,
			createdAt: message.createdAt,
			content: message.content,
			mentions: message.mentions.length,
			roleMentions: message.roleMentions.length
		};
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
}

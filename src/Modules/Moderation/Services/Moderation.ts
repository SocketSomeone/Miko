import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message, TextChannel, EmbedField, User } from 'eris';
import { Punishment, BasePunishment } from '../../../Entity/Punishment';
import { Violation } from '../../../Misc/Enums/Violation';
import { BaseMember } from '../../../Entity/Member';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { Images } from '../../../Misc/Enums/Images';

import moment from 'moment';
import i18n from 'i18n';
import { DISCORD_EMOJI_REGEX, EMOJIS_REGEX } from '../../../Misc/Regex/Emoji';
import { Cache } from '../../../Framework/Decorators/Cache';
import { GuildSettingsCache } from '../../../Framework/Cache';
import { Service } from '../../../Framework/Decorators/Service';
import { MessagingService } from '../../../Framework/Services/Messaging';
import { WarnService } from './WarnService';
import { PunishmentService } from './Punishment';

export class ModerationService extends BaseService {
	@Service() protected punishmentService: PunishmentService;
	@Service() protected warnService: WarnService;
	@Service() protected messages: MessagingService;
	@Cache() protected guilds: GuildSettingsCache;

	public async addWarnAndPunish(
		guild: Guild,
		message: Message,
		type: Violation,
		settings: BaseSettings,
		moderator?: { user: Member; reason: string },
		extra?: EmbedField[]
	) {
		const { member } = message;

		const { warnsBefore, warnsAfter } = await this.warnService.addWarn(member, type);

		const punishmentConfigs = settings.punishmentConfig;
		const punishmentConfig = punishmentConfigs.find((c) => c.amount > warnsBefore && c.amount <= warnsAfter);

		if (punishmentConfig) {
			await this.punishmentService.punish(guild, member, punishmentConfig.type, settings, moderator, extra);
		}
	}

	public async sendWarnMessage(message: Message, type: Violation, settings: BaseSettings) {
		const t: TranslateFunc = (phrase, replace) => i18n.__({ locale: settings.locale, phrase }, replace);

		const reply = await this.messages.sendReply(
			message,
			{
				color: Color.YELLOW,
				timestamp: null,
				footer: null,
				author: {
					name: t('automod.desc', { type: t(`automod.violations.${type.toString()}`) }),
					icon_url: Images.WARN
				}
			},
			15 * 1000
		);
	}

	public async logModAction(
		guild: Guild,
		settings: BaseSettings,
		member: User | Member,
		target: User | Member,
		type: string | Punishment,
		extra: EmbedField[] = []
	) {
		if (!settings.modlog) return;

		const modLogChannel = guild.channels.get(settings.modlog) as TextChannel;

		if (!modLogChannel) return;

		const embed = this.messages.createEmbed({
			color: Color.DARK,
			thumbnail: { url: member.avatarURL },
			author: {
				name: `[${String(type).toUpperCase()}] ` + target.tag,
				icon_url: Images.MODERATION
			},
			fields: [
				{
					name: 'Target',
					value: target.mention,
					inline: true
				},
				{
					name: 'Moderator',
					value: member.mention,
					inline: true
				},
				...extra.map((e) => {
					return {
						name: e.name,
						value: e.value,
						inline: true
					};
				})
			],
			footer: null
		});

		await this.messages.sendEmbed(modLogChannel, embed);
	}

	public countEmojis(message: Message): number {
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
}

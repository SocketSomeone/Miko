import i18n from 'i18n';

import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message, TextChannel, EmbedField, User } from 'eris';
import { Punishment } from '../../../Entity/Punishment';
import { Violation } from '../../../Misc/Enums/Violation';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Color } from '../../../Misc/Enums/Colors';
import { BaseSettings } from '../../../Entity/GuildSettings';
import { Images } from '../../../Misc/Enums/Images';
import { DISCORD_EMOJI_REGEX, EMOJIS_REGEX } from '../../../Misc/Regex/Emoji';
import { Cache } from '../../../Framework/Decorators/Cache';
import { GuildSettingsCache } from '../../../Framework/Cache';
import { Service } from '../../../Framework/Decorators/Service';
import { MessagingService } from '../../../Framework/Services/Messaging';
import { WarnService } from './WarnService';
import { PunishmentService } from './Punishment';
import { duration } from 'moment';

export class ModerationService extends BaseService {
	@Service() protected punishmentService: PunishmentService;
	@Service() protected warnService: WarnService;
	@Service() protected messages: MessagingService;
	@Cache() protected guilds: GuildSettingsCache;

	public async addWarnAndPunish(
		guild: Guild,
		{ member }: { member: Member } | Message,
		settings: BaseSettings,
		extra?: EmbedField[]
	) {
		const { warnsBefore, warnsAfter } = await this.warnService.addWarn(member);

		const punishmentConfigs = settings.autoMod.config;
		const punishmentConfig = punishmentConfigs.find((c) => c.amount > warnsBefore && c.amount <= warnsAfter);

		if (punishmentConfig) {
			await this.punishmentService.punish(
				guild,
				member,
				punishmentConfig.type,
				settings,
				duration(punishmentConfig.duration, 'seconds'),
				{ user: null, reason: 'Warn limit exceeded' },
				extra
			);
		}
	}

	public async sendWarnMessage(message: Message, type: Violation, settings: BaseSettings) {
		const embed = this.messages.createEmbed({
			color: Color.YELLOW,
			timestamp: null,
			footer: null,
			author: {
				name: 'Message warn',
				icon_url: Images.WARN
			}
		});

		await this.messages.sendReply(message, embed, 15 * 1000);
	}

	public async logModAction(
		guild: Guild,
		settings: BaseSettings,
		member: User | Member,
		target: User | Member,
		type: string | Punishment,
		extra: EmbedField[] = []
	) {
		if (!settings.logger.moder) return;

		const modLogChannel = guild.channels.get(settings.logger.moder) as TextChannel;

		if (!modLogChannel) return;

		const t: TranslateFunc = (phrase, replacements) => i18n.__({ locale: settings.locale, phrase }, replacements);

		const embed = this.messages.createEmbed({
			color: Color.DARK,
			thumbnail: { url: member.avatarURL },
			author: {
				name: `[${String(type).toUpperCase()}] ` + target.tag,
				icon_url: Images.MODERATION
			},
			fields: [
				{
					name: t('logs.misc.target'),
					value: target.mention,
					inline: true
				},
				{
					name: t('logs.misc.moderator'),
					value: member.mention,
					inline: true
				},
				...extra.map((e) => {
					return {
						name: t(`logs.misc.${e.name.toLowerCase()}`),
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

	public editableRoles(guild: Guild, roles: string[], me: Member) {
		const highestBotRole = this.getHighestRole(guild, me.roles);

		return roles.map((r) => guild.roles.get(r)).filter((r) => !!r && highestBotRole.position > r.position);
	}

	public isPunishable(guild: Guild, targetMember: Member, authorMember: Member, me: Member) {
		const highestBotRole = this.getHighestRole(guild, me.roles);
		const highestMemberRole = this.getHighestRole(guild, targetMember.roles);
		const highestAuthorRole = this.getHighestRole(guild, authorMember.roles);

		if (guild.ownerID === authorMember.id)
			return (
				targetMember.id !== me.user.id &&
				targetMember.id !== authorMember.id &&
				highestBotRole.position > highestMemberRole.position
			);
		else
			return (
				targetMember.id !== guild.ownerID &&
				targetMember.id !== me.user.id &&
				targetMember.id !== authorMember.id &&
				highestBotRole.position > highestMemberRole.position &&
				highestAuthorRole.position > highestMemberRole.position
			);
	}
}

import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { BaseModule } from '../../../../Framework/Module';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver, StringResolver, DurationResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { ScheduledAction } from '../../../../Entity/ScheduledAction';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';

import moment, { Duration } from 'moment';
import { Service } from '../../../../Framework/Decorators/Service';
import { SchedulerService } from '../../../../Framework/Services/Scheduler';
import { ModerationService } from '../../Services/Moderation';
import { PunishmentService } from '../../Services/Punishment';

export default class extends BaseCommand {
	@Service() protected scheduler: SchedulerService;
	@Service() protected moderation: ModerationService;
	@Service() protected punishment: PunishmentService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'tempmute',
			aliases: ['темпмут', 'тмут'],
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				},
				{
					name: 'duration',
					resolver: DurationResolver,
					required: true
				},
				{
					name: 'reason',
					resolver: StringResolver,
					full: true
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES],
			premiumOnly: false,
			examples: ['@user 1m', '@user 1m 4.1']
		});
	}

	public async execute(
		message: Message,
		[member, duration, reason]: [Member, Duration, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		const extra = [
			{ name: 'Reason', value: reason },
			{ name: 'Duration', value: duration.locale(settings.locale).humanize(false) }
		];

		const embed = this.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.mute.title'), icon_url: Images.MODERATION },
			description: t('moderation.mute.done', {
				user: `${message.author.tag}`,
				target: `${member.user.tag}`
			}),
			fields: extra.map((x) => {
				return {
					name: x.name,
					value: x.value,
					inline: true
				};
			}),
			footer: { icon_url: message.author.avatarURL, text: t('moderation.mute.until') },
			timestamp: moment().add(duration).toISOString()
		});

		const mutedRole = settings.moderation.muteRole;

		if (!mutedRole || !guild.roles.has(mutedRole)) {
			throw new ExecuteError(t('error.missed.muterole'));
		} else if (member.roles.includes(mutedRole)) {
			throw new ExecuteError(t('moderation.mute.already'));
		} else if (this.moderation.isPunishable(guild, member, message.member, me)) {
			try {
				await this.punishment.punish(
					guild,
					member,
					Punishment.MUTE,
					settings,
					duration,
					{ user: message.member, reason },
					extra
				);

				await this.scheduler.addScheduledAction(
					guild.id,
					ScheduledAction.UNMUTE,
					{ memberId: member.id, roleId: mutedRole },
					moment().add(duration)
				);
			} catch (err) {
				console.log(err);
				throw new ExecuteError(t('moderation.mute.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.mute.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

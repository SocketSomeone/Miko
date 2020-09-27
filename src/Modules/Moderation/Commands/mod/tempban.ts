import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver, StringResolver, DurationResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { ScheduledAction } from '../../../../Entity/ScheduledAction';
import { Images } from '../../../../Misc/Enums/Images';

import moment, { Duration } from 'moment';
import { BaseModule } from '../../../../Framework/Module';
import { Service } from '../../../../Framework/Decorators/Service';
import { SchedulerService } from '../../../../Framework/Services/Scheduler';
import { ModerationService } from '../../Services/Moderation';

export default class extends BaseCommand {
	@Service() scheduler: SchedulerService;
	@Service() moderation: ModerationService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'tempban',
			aliases: ['темпбан', 'тбан'],
			group: CommandGroup.MODERATION,
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
			botPermissions: [GuildPermission.BAN_MEMBERS],
			userPermissions: [GuildPermission.BAN_MEMBERS],
			premiumOnly: false,
			examples: ['@user 1m', '@user 1m 4.1']
		});
	}

	public async execute(
		message: Message,
		[member, duration, r]: [Member, Duration, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		const reason = r || t('moderation.noreason');
		const extra = [
			{ name: 'logs.mod.reason', value: reason },
			{ name: 'logs.mod.duration', value: duration.locale(settings.locale).humanize(false) }
		];

		const embed = this.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.ban.title'), icon_url: Images.MODERATION },
			description: t('moderation.ban.done', {
				user: `${message.author.username}#${message.author.discriminator}`,
				target: `${member.user.username}#${member.user.discriminator}`
			}),
			fields: extra.map((x) => {
				return {
					name: t(x.name),
					value: x.value,
					inline: true
				};
			}),
			footer: { icon_url: message.author.avatarURL, text: t('moderation.ban.until') },
			timestamp: moment().add(duration).toISOString()
		});

		if (this.moderation.isPunishable(guild, member, message.member, me)) {
			await BasePunishment.informUser(t, member, Punishment.MUTE, extra);

			try {
				await guild.banMember(member.id, 7, encodeURIComponent(reason));

				await BaseMember.saveMembers(guild, [member]);

				await BasePunishment.new({
					settings,
					member: message.member,
					target: member,
					extra,
					opts: {
						type: Punishment.BAN,
						args: '',
						date: moment().add(duration),
						reason,
						moderator: message.author.id
					}
				});

				await this.scheduler.addScheduledAction(
					guild.id,
					ScheduledAction.UNBAN,
					{ memberId: member.id },
					moment().add(duration)
				);
			} catch (err) {
				console.log(err);
				throw new ExecuteError(t('moderation.ban.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.ban.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

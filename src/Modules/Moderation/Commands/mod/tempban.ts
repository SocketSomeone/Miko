import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

import moment, { Duration } from 'moment';
import { Color } from '../../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { MemberResolver, StringResolver, DurationResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Enums/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { ScheduledAction } from '../../../../Entity/ScheduledAction';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'tempban',
			aliases: ['темпбан'],
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
					rest: true
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.BAN_MEMBERS],
			userPermissions: [GuildPermission.BAN_MEMBERS],
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[member, duration, reason]: [Member, Duration, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		reason = reason || t('moderation.noreason');

		const embed = this.client.messages.createEmbed(
			{
				color: ColorResolve(Color.RED),
				title: t('moderation.ban.title'),
				fields: [],
				footer: {
					text: ''
				}
			},
			false
		);

		if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			const extra = [
				{ name: 'logs.mod.reason', value: reason },
				{ name: 'logs.mod.duration', value: duration.locale(settings.locale).humanize(false) }
			];

			await BasePunishment.informUser(member, Punishment.BAN, settings, extra);

			try {
				await guild.banMember(member.id, 7, encodeURIComponent(reason));

				await BaseMember.saveMembers(guild, [member]);

				await BasePunishment.new({
					client: this.client,
					settings,
					member: message.member,
					target: member,
					extra,
					opts: {
						type: Punishment.BAN,
						amount: 0,
						args: '',
						date: moment().add(duration),
						reason,
						moderator: message.author.id
					}
				});

				await this.client.scheduler.addScheduledAction(
					guild.id,
					ScheduledAction.UNBAN,
					{ memberId: member.id },
					moment().add(duration)
				);

				embed.color = ColorResolve(Color.DARK);
				embed.timestamp = moment().add(duration).toISOString();
				embed.footer = { icon_url: message.author.avatarURL, text: t('moderation.ban.until') };
				embed.description = t('moderation.ban.done', {
					user: `${message.author.username}#${message.author.discriminator}`,
					target: `${member.user.username}#${member.user.discriminator}`,
					reason
				});

				embed.fields.push(
					...extra
						.filter((x) => !!x.value)
						.map((x) => {
							return {
								name: t(x.name),
								value: x.value.substr(0, 1024),
								inline: true
							};
						})
				);
			} catch (err) {
				console.log(err);
				embed.description = t('moderation.ban.error');
			}
		} else {
			embed.description = t('moderation.ban.cannot');
		}

		await this.replyAsync(message, t, embed);
	}
}

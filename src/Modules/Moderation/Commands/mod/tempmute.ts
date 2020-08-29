import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
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

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'tempmute',
			aliases: ['темпмут', 'тмут'],
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
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES],
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

		const embed = this.client.messages.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.mute.title'), icon_url: Images.MODERATION },
			description: t('moderation.mute.done', {
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
			footer: { icon_url: message.author.avatarURL, text: t('moderation.mute.until') },
			timestamp: moment().add(duration).toISOString()
		});

		const mutedRole = settings.mutedRole;

		if (!mutedRole || !guild.roles.has(mutedRole)) {
			throw new ExecuteError(t('error.missed.muterole'));
		} else if (member.roles.includes(mutedRole)) {
			throw new ExecuteError(t('moderation.mute.already'));
		} else if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			await BasePunishment.informUser(t, member, Punishment.MUTE, extra);

			try {
				await member.addRole(mutedRole, encodeURIComponent(reason));

				await BaseMember.saveMembers(guild, [member]);

				await BasePunishment.new({
					client: this.client,
					settings,
					member: message.member,
					target: member,
					extra,
					opts: {
						type: Punishment.MUTE,
						args: '',
						date: moment().add(duration),
						reason,
						moderator: message.author.id
					}
				});

				await this.client.scheduler.addScheduledAction(
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

		await this.replyAsync(message, t, embed);
	}
}

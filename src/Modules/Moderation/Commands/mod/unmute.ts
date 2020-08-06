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
			name: 'unmute',
			aliases: ['размутить'],
			group: CommandGroup.MODERATION,
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				}
			],
			guildOnly: true,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES],
			premiumOnly: false
		});
	}

	public async execute(
		message: Message,
		[member, reason]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		reason = reason || t('moderation.noreason');

		const embed = this.client.messages.createEmbed(
			{
				color: ColorResolve(Color.RED),
				title: t('moderation.unmute.title'),
				fields: [],
				footer: {
					text: ''
				}
			},
			false
		);

		const mutedRole = settings.mutedRole;

		if (!mutedRole || !guild.roles.has(mutedRole)) {
			embed.description = t('error.missed.muterole');
		} else if (!member.roles.includes(mutedRole)) {
			embed.description = t('moderation.unmute.notmuted');
		} else if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			try {
				await member.removeRole(mutedRole, `Unmuted by ${message.author.username}#${message.author.discriminator}`);

				await BasePunishment.logModAction({
					client: this.client,
					settings,
					member: message.member,
					target: member,
					type: 'UNMUTE'
				});

				embed.color = ColorResolve(Color.DARK);
				embed.description = t('moderation.unmute.done', {
					user: `${message.author.username}#${message.author.discriminator}`,
					target: `${member.user.username}#${member.user.discriminator}`
				});
			} catch (err) {
				embed.description = t('moderation.unmute.error');
			}
		} else {
			embed.description = t('moderation.unmute.cannot');
		}

		await this.replyAsync(message, t, embed);
	}
}

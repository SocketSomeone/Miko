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
			name: 'mute',
			aliases: ['мут', 'замутить'],
			group: CommandGroup.MODERATION,
			args: [
				{
					name: 'user',
					resolver: MemberResolver,
					required: true
				},
				{
					name: 'reason',
					resolver: StringResolver,
					rest: true
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
				title: t('moderation.mute.title'),
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
		} else if (member.roles.includes(mutedRole)) {
			embed.description = t('moderation.mute.already');
		} else if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			const extra = [
				{ name: 'logs.mod.reason', value: reason },
				{ name: 'logs.mod.duration', value: `∞` }
			];

			await BasePunishment.informUser(member, Punishment.MUTE, settings, extra);

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
						amount: 0,
						args: '',
						reason,
						moderator: message.author.id
					}
				});

				embed.color = ColorResolve(Color.DARK);
				embed.description = t('moderation.mute.done', {
					user: `${message.author.username}#${message.author.discriminator}`,
					target: `${member.user.username}#${member.user.discriminator}`
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
				embed.description = t('moderation.mute.error');
			}
		} else {
			embed.description = t('moderation.mute.cannot');
		}

		await this.replyAsync(message, t, embed);
	}
}

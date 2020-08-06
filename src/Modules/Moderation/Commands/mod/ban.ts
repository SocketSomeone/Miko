import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';

import moment from 'moment';
import { Color } from '../../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { MemberResolver, StringResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Enums/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'ban',
			aliases: ['бан', 'забанить'],
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
					full: true
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
		[member, reason]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		reason = reason || t('moderation.noreason');

		const embed = this.client.messages.createEmbed(
			{
				color: ColorResolve(Color.RED),
				title: t('moderation.ban.title'),
				footer: {
					text: ''
				}
			},
			false
		);

		if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			const extra = [
				{ name: 'logs.mod.reason', value: reason },
				{ name: 'logs.mod.duration', value: `∞` }
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
						reason,
						moderator: message.author.id
					}
				});

				embed.color = ColorResolve(Color.DARK);
				embed.description = t('moderation.ban.done', {
					user: `${message.author.username}#${message.author.discriminator}`,
					target: `${member.user.username}#${member.user.discriminator}`
				});

				embed.fields.push(
					...extra
						.filter((x) => !!x.value)
						.map((x) => {
							return { name: t(x.name), value: x.value.substr(0, 1024), inline: true };
						})
				);
			} catch (err) {
				embed.description = t('moderation.ban.error');
			}
		} else {
			embed.description = t('moderation.ban.cannot');
		}

		await this.replyAsync(message, t, embed);
	}
}

import { Command, Context } from '../../../../Framework/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { Color } from '../../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../../Misc/Utils/ColorResolver';
import { MemberResolver, StringResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'kick',
			aliases: ['кик', 'кикнуть'],
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
			botPermissions: [GuildPermission.KICK_MEMBERS],
			userPermissions: [GuildPermission.KICK_MEMBERS],
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
				title: t('moderation.kick.title'),
				footer: {
					text: ''
				}
			},
			false
		);

		if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			const extra = [{ name: 'logs.mod.reason', value: reason }];

			await BasePunishment.informUser(member, Punishment.KICK, settings, extra);

			try {
				await guild.kickMember(member.id, encodeURIComponent(reason));

				await BaseMember.saveMembers(guild, [member]);

				await BasePunishment.new({
					client: this.client,
					settings,
					member: message.member,
					target: member,
					extra,
					opts: {
						type: Punishment.KICK,
						args: '',
						reason,
						moderator: message.author.id
					}
				});

				embed.color = ColorResolve(Color.DARK);
				embed.description = t('moderation.kick.done', {
					user: `${message.author.username}#${message.author.discriminator}`,
					target: `${member.user.username}#${member.user.discriminator}`
				});

				//#region
				embed.fields.push(
					...extra
						.filter((x) => !!x.value)
						.map((x) => {
							return { name: t(x.name), value: x.value.substr(0, 1024), inline: true };
						})
				);
				//#endregion
			} catch (err) {
				console.log(err);
				embed.description = t('moderation.kick.error');
			}
		} else {
			embed.description = t('moderation.kick.cannot');
		}

		await this.replyAsync(message, t, embed);
	}
}

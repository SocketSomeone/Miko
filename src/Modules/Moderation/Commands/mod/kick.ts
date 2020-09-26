import { Command, Context } from '../../../../Framework/Services/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver, StringResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';

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
			premiumOnly: false,
			examples: ['@user', '@user 4.1']
		});
	}

	public async execute(
		message: Message,
		[member, r]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		const reason = r || t('moderation.noreason');
		const extra = [{ name: 'logs.mod.reason', value: reason }];

		const embed = this.client.messages.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.kick.title'), icon_url: Images.MODERATION },
			footer: null,
			description: t('moderation.kick.done', {
				user: `${message.author.username}#${message.author.discriminator}`,
				target: `${member.user.username}#${member.user.discriminator}`
			}),
			fields: extra.map((x) => {
				return {
					name: t(x.name),
					value: x.value,
					inline: true
				};
			})
		});

		if (this.client.moderation.isPunishable(guild, member, message.member, me)) {
			await BasePunishment.informUser(t, member, Punishment.MUTE, extra);

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
			} catch (err) {
				throw new ExecuteError(t('moderation.kick.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.kick.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

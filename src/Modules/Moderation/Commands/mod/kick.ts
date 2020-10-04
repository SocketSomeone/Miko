import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver, StringResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Images } from '../../../../Misc/Enums/Images';
import { BaseModule } from '../../../../Framework/Module';
import { Service } from '../../../../Framework/Decorators/Service';
import { ModerationService } from '../../Services/Moderation';

export default class extends BaseCommand {
	@Service() protected moderation: ModerationService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'kick',
			aliases: ['кик', 'кикнуть'],
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

		const embed = this.createEmbed({
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

		if (this.moderation.isPunishable(guild, member, message.member, me)) {
			await BasePunishment.informUser(t, member, Punishment.KICK, extra);

			try {
				await guild.kickMember(member.id, encodeURIComponent(reason));

				await BaseMember.saveMembers(guild, [member]);

				await BasePunishment.new({
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

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
import { PunishmentService } from '../../Services/Punishment';

export default class extends BaseCommand {
	@Service() protected moderation: ModerationService;
	@Service() protected punishment: PunishmentService;

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
		[member, reason]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		const extra = [{ name: 'Reason', value: reason }];

		const embed = this.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.kick.title'), icon_url: Images.MODERATION },
			footer: null,
			description: t('moderation.kick.done', {
				user: `${message.author.tag}`,
				target: `${member.user.tag}`
			}),
			fields: extra.map((x) => {
				return {
					name: x.name,
					value: x.value,
					inline: true
				};
			})
		});

		if (this.moderation.isPunishable(guild, member, message.member, me)) {
			try {
				await this.punishment.punish(
					guild,
					member,
					Punishment.KICK,
					settings,
					null,
					{ user: message.member, reason },
					extra
				);
			} catch (err) {
				throw new ExecuteError(t('moderation.kick.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.kick.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

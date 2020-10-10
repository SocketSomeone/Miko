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
import { duration } from 'moment';

export default class extends BaseCommand {
	@Service() protected moderation: ModerationService;
	@Service() protected punishment: PunishmentService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'warn',
			aliases: ['пред'],
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
			botPermissions: [GuildPermission.KICK_MEMBERS, GuildPermission.BAN_MEMBERS, GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.KICK_MEMBERS, GuildPermission.BAN_MEMBERS, GuildPermission.MANAGE_ROLES],
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
			author: { name: t('moderation.warn.title'), icon_url: Images.MODERATION },
			footer: null,
			description: t('moderation.warn.done', {
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
					Punishment.WARN,
					settings,
					duration(7, 'days'),
					{ user: message.member, reason },
					extra
				);
			} catch (err) {
				throw new ExecuteError(t('moderation.warn.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.warn.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

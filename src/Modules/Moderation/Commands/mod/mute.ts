import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { BaseMember } from '../../../../Entity/Member';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver, StringResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { Punishment, BasePunishment } from '../../../../Entity/Punishment';
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
			name: 'mute',
			aliases: ['мут', 'замутить'],
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
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES],
			premiumOnly: false,
			examples: ['@user', '@user 4.1']
		});
	}

	public async execute(
		message: Message,
		[member, reason]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		const extra = [
			{ name: 'Reason', value: reason },
			{ name: 'Duration', value: `∞` }
		];

		const embed = this.createEmbed({
			color: Color.DARK,
			author: { name: t('moderation.mute.title'), icon_url: Images.MODERATION },
			description: t('moderation.mute.done', {
				user: `${message.author.tag}`,
				target: `${member.user.tag}`
			}),
			fields: extra.map((x) => {
				return {
					name: x.name,
					value: x.value,
					inline: true
				};
			}),
			footer: null
		});

		const mutedRole = settings.mutedRole;

		if (!mutedRole || !guild.roles.has(mutedRole)) {
			throw new ExecuteError(t('error.missed.muterole'));
		} else if (member.roles.includes(mutedRole)) {
			throw new ExecuteError(t('moderation.mute.already'));
		} else if (this.moderation.isPunishable(guild, member, message.member, me)) {
			try {
				await this.punishment.punish(guild, member, Punishment.MUTE, settings, { user: message.member, reason }, extra);
			} catch (err) {
				console.log(err);
				throw new ExecuteError(t('moderation.mute.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.mute.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

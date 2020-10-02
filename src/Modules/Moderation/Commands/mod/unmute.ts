import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { Message, Member } from 'eris';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { BaseModule } from '../../../../Framework/Module';
import { Service } from '../../../../Framework/Decorators/Service';
import { ModerationService } from '../../Services/Moderation';
import { LoggingService } from '../../../Log/Services/LoggerService';

export default class extends BaseCommand {
	@Service() protected moderation: ModerationService;
	@Service() protected logger: LoggingService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'unmute',
			aliases: ['размутить'],
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
			premiumOnly: false,
			examples: ['@user']
		});
	}

	public async execute(
		message: Message,
		[target, reason]: [Member, string],
		{ funcs: { t, e }, guild, me, settings }: Context
	) {
		reason = reason || t('moderation.noreason');

		const embed = this.createEmbed({
			color: Color.DARK,
			title: t('moderation.unmute.title'),
			description: t('moderation.unmute.done', {
				user: `${message.author.username}#${message.author.discriminator}`,
				target: `${target.user.username}#${target.user.discriminator}`
			}),
			footer: null
		});

		const mutedRole = settings.mutedRole;

		if (!mutedRole || !guild.roles.has(mutedRole)) {
			throw new ExecuteError(t('error.missed.muterole'));
		} else if (!target.roles.includes(mutedRole)) {
			throw new ExecuteError(t('moderation.unmute.notmuted'));
		} else if (this.moderation.isPunishable(guild, target, message.member, me)) {
			try {
				await target.removeRole(mutedRole, `Unmuted by ${message.author.username}#${message.author.discriminator}`);

				await this.logger.logModAction({
					sets: settings,
					member: message.member,
					type: 'UNMUTE',
					target
				});
			} catch (err) {
				throw new ExecuteError(t('moderation.unmute.error'));
			}
		} else {
			throw new ExecuteError(t('moderation.unmute.cannot'));
		}

		await this.replyAsync(message, embed);
	}
}

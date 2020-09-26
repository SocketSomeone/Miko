import { Command, Context } from '../../../../Framework/Services/Commands/Command';
import { BaseClient } from '../../../../Client';
import { CommandGroup } from '../../../../Misc/Models/CommandGroup';
import { Message, Member } from 'eris';
import { ExecuteError } from '../../../../Framework/Errors/ExecuteError';
import { Color } from '../../../../Misc/Enums/Colors';
import { MemberResolver } from '../../../../Framework/Resolvers';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';

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

		const embed = this.client.messages.createEmbed({
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
		} else if (this.client.moderation.isPunishable(guild, target, message.member, me)) {
			try {
				await target.removeRole(mutedRole, `Unmuted by ${message.author.username}#${message.author.discriminator}`);

				await this.client.logger.logModAction({
					sets: settings,
					member: message.member,
					type: 'UNMUTE',
					target,
					t
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

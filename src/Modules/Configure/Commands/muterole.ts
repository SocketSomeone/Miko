import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { RoleResolver } from '../../../Framework/Resolvers';
import { Message, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'muterole',
			aliases: ['мутроль'],
			args: [
				{
					name: 'role',
					resolver: RoleResolver
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES],
			examples: ['@role']
		});
	}

	public async execute(message: Message, [role]: [Role], { funcs: { t, e }, guild, settings }: Context) {
		if (role) {
			if (role.id === settings.moderation.muteRole) throw new ExecuteError(t('error.changes.not'));

			settings.moderation.muteRole = role.id;
			await settings.save();
		}

		if (!settings.moderation.muteRole || !guild.roles.has(settings.moderation.muteRole))
			throw new ExecuteError(t('configure.muterole.notFound'));

		await this.replyAsync(message, {
			color: role ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: role ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.muterole.${role ? 'new' : 'info'}`, {
				role: `<@&${settings.moderation.muteRole}>`
			}),
			footer: null,
			timestamp: null
		});
	}
}

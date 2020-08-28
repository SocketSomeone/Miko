import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { RoleResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'muterole',
			aliases: ['мутроль'],
			args: [
				{
					name: 'role',
					resolver: RoleResolver
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.MANAGE_ROLES]
		});
	}

	public async execute(message: Message, [role]: [Role], { funcs: { t, e }, guild, settings }: Context) {
		if (role) {
			settings.mutedRole = role.id;
			await settings.save();
		}

		if (!settings.mutedRole || !guild.roles.has(settings.mutedRole))
			throw new ExecuteError(t('configure.muterole.notFound'));

		await this.replyAsync(message, t, {
			color: role ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: role ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.muterole.${role ? 'new' : 'info'}`, {
				role: `<@&${settings.mutedRole}>`
			}),
			footer: null,
			timestamp: null
		});
	}
}

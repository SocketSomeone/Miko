import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, RoleResolver, EnumResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Role } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

enum Action {
	ADD = 'add',
	DELETE = 'DELETE'
}

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome roles',
			aliases: [],
			args: [
				{
					name: 'add/delete',
					resolver: new EnumResolver(client, Object.values(Action))
				},
				{
					name: 'role',
					resolver: RoleResolver,
					required: false
				}
			],
			group: CommandGroup.WELCOME,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(
		message: Message,
		[action, role]: [Action, Role],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		if (role) {
			if (settings.onWelcomeRoles.has(role.id)) settings.onWelcomeRoles.delete(role.id);
			else settings.onWelcomeRoles.add(role.id);

			await settings.save();
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: !guild.roles.some((x) => settings.onWelcomeRoles.has(x.id))
				? t('configure.aar.notFound')
				: t(`configure.aar.${role ? 'new' : 'info'}`, {
						role: [...settings.onWelcomeRoles].map((x) => `<@&${x}>`).join('\n')
				  }),
			footer: {
				text: ''
			}
		});
	}
}

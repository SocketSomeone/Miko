import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, RoleResolver, EnumResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Role } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

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
		const embed = this.createEmbed(
			{
				color: ColorResolve(Color.MAGENTA),
				title: t('configure.title', {
					guild: guild.name
				}),
				description: t('welcome.aar.list', {
					roles: [...settings.onWelcomeRoles]
						.filter((x) => guild.roles.has(x))
						.map((x) => `<@&${x}>`)
						.join(', ')
				}),
				footer: null
			},
			false
		);

		if (role) {
			switch (action) {
				case Action.ADD: {
					if (!settings.onWelcomeRoles.has(role.id)) settings.onWelcomeRoles.add(role.id);

					embed.description = t('welcome.aar.added', {
						role: role.mention
					});
					break;
				}

				case Action.DELETE: {
					if (settings.onWelcomeRoles.has(role.id)) settings.onWelcomeRoles.delete(role.id);

					embed.description = t('welcome.aar.deleted', {
						role: role.mention
					});
					break;
				}
			}

			await settings.save();
		}

		await this.replyAsync(message, t, embed);
	}
}

import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { RoleResolver, EnumResolver } from '../../../Framework/Resolvers';
import { Message, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

enum Action {
	ADD = 'add',
	DELETE = 'DELETE'
}

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome roles',
			aliases: [],
			args: [
				{
					name: 'add | delete',
					resolver: new EnumResolver(module, Object.values(Action))
				},
				{
					name: 'role',
					resolver: RoleResolver
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_ROLES],
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['add @role', 'delete @role']
		});
	}

	public async execute(
		message: Message,
		[action, role]: [Action, Role],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		if (!settings.welcome.enabled) throw new ExecuteError(t('error.module.disabled'));

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			author: { name: t('welcome.title'), icon_url: Images.SUCCESS },
			description: t('welcome.aar.list', {
				roles: [...settings.welcome.roles]
					.filter((x) => guild.roles.has(x))
					.map((x) => `<@&${x}>`)
					.join(', ')
			}),
			footer: null,
			timestamp: null
		});

		if (role) {
			switch (action) {
				case Action.ADD: {
					if (!settings.welcome.roles.has(role.id)) settings.welcome.roles.add(role.id);

					embed.description = t('welcome.aar.added', {
						role: role.mention
					});
					break;
				}

				case Action.DELETE: {
					if (settings.welcome.roles.has(role.id)) settings.welcome.roles.delete(role.id);

					embed.description = t('welcome.aar.deleted', {
						role: role.mention
					});
					break;
				}
			}

			await settings.save();
		}

		await this.replyAsync(message, embed);
	}
}

import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, RoleResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Role } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'autoassignrole',
			aliases: ['aar', 'рольпризаходе'],
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
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [role]: [Role], { funcs: { t, e }, guild, settings }: Context) {
		if (role) {
			settings.autoassignRole = role.id;
			await this.client.cache.guilds.updateOne(guild);
		}

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description:
				!settings.autoassignRole || !guild.roles.has(settings.autoassignRole)
					? t('configure.aar.notFound')
					: t(`configure.aar.${role ? 'new' : 'info'}`, {
							role: `<@&${settings.autoassignRole}>`
					  }),
			footer: {
				text: ''
			}
		});
	}
}

import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, EnumResolver, RoleResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Role } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { Violation } from '../../../Misc/Models/Violation';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'automodignorerole',
			aliases: ['amir'],
			args: [
				{
					name: 'role',
					resolver: RoleResolver,
					required: true
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.ADMINISTRATOR],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [role]: [Role], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.autoModIgnoreRoles.includes(role.id)) {
			settings.autoModIgnoreRoles.splice(
				settings.autoModIgnoreRoles.findIndex((x) => x === role.id),
				1
			);
		} else {
			settings.autoModIgnoreRoles.push(role.id);
		}
		await this.client.cache.guilds.updateOne(guild);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('configure.title', {
				guild: guild.name
			}),
			description: t(`configure.automod.amir.${settings.autoModIgnoreRoles.includes(role.id) ? 'added' : 'deleted'}`, {
				role: role.mention
			}),
			footer: {
				text: ''
			}
		});
	}
}

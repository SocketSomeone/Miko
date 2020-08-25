import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role, GuildChannel } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import {
	AnyResolver,
	RoleResolver,
	MemberResolver,
	BooleanResolver,
	ChannelResolver,
	NumberResolver
} from '../../../Framework/Resolvers';
import { PermissionTargetResolver } from '../Resolvers/PermissionResolver';
import { PermissionsTarget, PermissionsFrom, Permission } from '../../../Misc/Models/Permisson';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'permissions clear',
			aliases: ['правила очистить'],
			group: CommandGroup.PERMISSIONS,
			args: [],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [], { funcs: { t }, guild, settings }: Context) {
		const permissions = await this.client.cache.permissions.get(guild);

		if (permissions.length < 1) throw new ExecuteError(t('perms.cleared'));

		await this.client.cache.permissions.save(guild.id, []);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('perms.title'),
			description: t('perms.clear')
		});
	}
}

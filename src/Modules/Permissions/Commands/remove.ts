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
			name: 'permission remove',
			aliases: ['правило удалить'],
			group: CommandGroup.PERMISSIONS,
			args: [
				{
					name: 'number',
					resolver: new NumberResolver(client, 1),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [index]: [number], { funcs: { t }, guild, settings }: Context) {
		const permissions = await this.client.cache.permissions.get(guild.id);

		if (typeof permissions[index - 1] === 'undefined') throw new ExecuteError(t('perms.notFound'));

		permissions.splice(index - 1, 1);
		await this.client.cache.permissions.save(guild.id, permissions);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('perms.title'),
			description: t('perms.remove', {
				index
			})
		});
	}
}

import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message, Member, Role, GuildChannel, TextChannel } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import {
	AnyResolver,
	RoleResolver,
	MemberResolver,
	BooleanResolver,
	ChannelResolver
} from '../../../Framework/Resolvers';
import { PermissionTargetResolver } from '../Resolvers/PermissionResolver';
import { PermissionsTarget, PermissionsFrom, Permission } from '../../../Misc/Models/Permisson';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import PermissionsOutput from '../Misc/PermissionsOutput';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'permission add',
			aliases: ['правило добавить'],
			group: CommandGroup.PERMISSIONS,
			args: [
				{
					name: 'module/command',
					resolver: PermissionTargetResolver,
					required: true
				},
				{
					name: 'role/member/channel',
					resolver: new AnyResolver(
						client,
						new MemberResolver(client),
						new RoleResolver(client, true),
						new ChannelResolver(client)
					),
					required: true
				},
				{
					name: 'state',
					resolver: BooleanResolver,
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(
		message: Message,
		[target, from, allow]: [PermissionsTarget, Role | Member | GuildChannel, boolean],
		{ funcs: { t }, guild, settings }: Context
	) {
		const permissions = await this.client.cache.permissions.get(guild.id);

		let perm = permissions.find((x) => x.target.id === target.id && x.activator.id === from.id);
		let isExist = !!perm;

		if (!perm) {
			perm = {
				allow,
				index:
					Math.max.apply(
						null,
						permissions.map((p) => p.index)
					) + 1,
				target,
				activator: {
					id: from.id,
					type: null
				}
			};

			switch (from.constructor) {
				case Member:
					perm.activator.type = PermissionsFrom.User;
					break;

				case Role:
					perm.activator.type = from.id === guild.id ? PermissionsFrom.Server : PermissionsFrom.Role;
					break;

				case TextChannel:
					perm.activator.type = PermissionsFrom.Channel;
					break;
			}

			permissions.push(perm);
		} else {
			perm.allow = allow;
		}

		await this.client.cache.permissions.save(guild.id, permissions);

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('perms.title'),
			description: t(isExist ? 'perms.changed' : 'perms.add', {
				index: perm.index,
				output: PermissionsOutput(t, perm, perm.index)
			})
		});
	}
}

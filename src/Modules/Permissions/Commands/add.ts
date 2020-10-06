import {
	AnyResolver,
	RoleResolver,
	MemberResolver,
	BooleanResolver,
	ChannelResolver
} from '../../../Framework/Resolvers';
import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message, Member, Role, GuildChannel, TextChannel } from 'eris';
import { PermissionTargetResolver } from '../Resolvers/PermissionResolver';
import { PermissionsTarget, Activator, Permission } from '../../../Misc/Models/Permisson';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';
import PermissionsOutput from '../Misc/PermissionsOutput';
import { ChannelType } from '../../../Types';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'permission add',
			aliases: ['правило добавить'],
			args: [
				{
					name: 'state',
					resolver: BooleanResolver,
					required: true
				},
				{
					name: 'role | member | channel',
					resolver: new AnyResolver(
						module,
						new MemberResolver(module),
						new RoleResolver(module, true),
						new ChannelResolver(module, ChannelType.GUILD_TEXT)
					),
					required: true
				},
				{
					name: 'module/command',
					resolver: PermissionTargetResolver,
					required: true,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['disable @role timely', 'disable #text all', 'enable @user ban']
		});
	}

	public async execute(
		message: Message,
		[allow, from, target]: [boolean, Role | Member | GuildChannel, PermissionsTarget],
		{ funcs: { t }, guild, settings }: Context
	) {
		const permissions = settings.permissions;

		let perm = permissions.find((x) => x.target.id === target.id && x.activator.id === from.id);
		let isExist = !!perm;

		if (!isExist) {
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
					perm.activator.type = Activator.User;
					break;

				case Role:
					perm.activator.type = from.id === guild.id ? Activator.Server : Activator.Role;
					break;

				case TextChannel:
					perm.activator.type = Activator.Channel;
					break;
			}

			permissions.push(perm);
		} else {
			perm.allow = allow;
		}

		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t('perms.title'), icon_url: Images.SUCCESS },
			description: t(isExist ? 'perms.changed' : 'perms.add', {
				index: perm.index,
				output: PermissionsOutput(t, perm, perm.index - 1)
			})
		});
	}
}

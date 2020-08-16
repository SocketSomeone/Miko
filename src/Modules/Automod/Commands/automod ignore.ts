import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, EnumResolver, RoleResolver, ChannelResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Role, Channel } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Violation } from '../../../Misc/Enums/Violation';
import { AnyResolver } from '../../../Framework/Resolvers/AnyResolver';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'automod ignore',
			aliases: ['autoignore'],
			args: [
				{
					name: 'role/channel',
					resolver: new AnyResolver(client, RoleResolver, ChannelResolver),
					required: false
				}
			],
			group: CommandGroup.AUTOMOD,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.ADMINISTRATOR],
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [target]: [Role | Channel], { funcs: { t, e }, guild, settings }: Context) {
		const embed = this.createEmbed({
			color: ColorResolve(Color.MAGENTA),
			title: t('automod.title', {
				guild: guild.name
			})
		});

		if (target instanceof Role) {
			if (settings.autoModIgnoreRoles.has(target.id)) settings.autoModIgnoreRoles.delete(target.id);
			else settings.autoModIgnoreRoles.add(target.id);

			embed.description = t(`automod.${settings.autoModIgnoreRoles.has(target.id) ? 'enabled' : 'disabled'}.amir`, {
				role: target.mention
			});
		} else {
			let channel = target || message.channel;

			if (settings.autoModIgnoreChannels.has(channel.id)) settings.autoModIgnoreChannels.delete(channel.id);
			else settings.autoModIgnoreChannels.add(channel.id);

			embed.description = t(`automod.${settings.autoModIgnoreRoles.has(target.id) ? 'enabled' : 'disabled'}.amic`, {
				channel: channel.mention
			});
		}

		await settings.save();

		await this.replyAsync(message, t, embed);
	}
}

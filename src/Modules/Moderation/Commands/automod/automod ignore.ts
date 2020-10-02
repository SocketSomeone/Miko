import { BaseCommand, Context } from '../../../../Framework/Commands/Command';
import { RoleResolver, ChannelResolver } from '../../../../Framework/Resolvers';
import { Message, Role, Channel } from 'eris';
import { Color } from '../../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../../Misc/Models/GuildPermissions';
import { AnyResolver } from '../../../../Framework/Resolvers/AnyResolver';
import { Images } from '../../../../Misc/Enums/Images';
import { ChannelType } from '../../../../Types';
import { BaseModule } from '../../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'automod ignore',
			aliases: ['autoignore'],
			args: [
				{
					name: 'role | channel',
					resolver: new AnyResolver(
						module,
						new RoleResolver(module),
						new ChannelResolver(module, ChannelType.GUILD_TEXT)
					),
					required: false
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['@role', '#text']
		});
	}

	public async execute(message: Message, [target]: [Role | Channel], { funcs: { t, e }, guild, settings }: Context) {
		const embed = this.createEmbed({
			author: {
				name: t('automod.title'),
				icon_url: Images.SUCCESS
			},
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
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

		await this.replyAsync(message, embed);
	}
}

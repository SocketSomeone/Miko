import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { ChannelResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Channel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { ChannelType } from '../../../Types';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'modlog',
			aliases: [],
			args: [
				{
					name: 'channel',
					resolver: new ChannelResolver(module, ChannelType.GUILD_TEXT),
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD],
			examples: ['#text']
		});
	}

	public async execute(message: Message, [channel]: [Channel], { funcs: { t, e }, guild, settings }: Context) {
		if (channel) {
			if (channel.id === settings.modlog) throw new ExecuteError(t('error.changes.not'));

			settings.modlog = channel.id;
			await settings.save();
		}

		if (!settings.modlog || !guild.channels.has(settings.modlog))
			throw new ExecuteError(t('configure.modlog.notFound'));

		await this.replyAsync(message, {
			color: channel ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: channel ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.modlog.${channel ? 'new' : 'info'}`, {
				channel: `<#${settings.modlog}>`
			}),
			footer: null,
			timestamp: null
		});
	}
}

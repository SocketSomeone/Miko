import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { ChannelResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Channel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'modlog',
			aliases: [],
			args: [
				{
					name: 'channel',
					resolver: ChannelResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [channel]: [Channel], { funcs: { t, e }, guild, settings }: Context) {
		if (channel && channel.id !== settings.modlog) {
			settings.modlog = channel.id;
			await settings.save();
		}

		if (!settings.modlog || !guild.channels.has(settings.modlog))
			throw new ExecuteError(t('configure.modlog.notFound'));

		await this.replyAsync(message, t, {
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

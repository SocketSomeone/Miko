import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { StringResolver, EnumResolver, ChannelResolver } from '../../../Framework/Resolvers';
import { Message, TextChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { AnyResolver } from '../../../Framework/Resolvers/AnyResolver';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { WelcomeChannelType } from '../../../Misc/Enums/WelcomeTypes';
import { Images } from '../../../Misc/Enums/Images';
import { ChannelType } from '../../../Types';
import { BaseModule } from '../../../Framework/Module';

enum Action {
	SET = 'set',
	DELETE = 'delete'
}

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome channel',
			aliases: [],
			args: [
				{
					name: 'set | delete',
					resolver: new EnumResolver(module, Object.values(Action)),
					required: true
				},
				{
					name: 'channel',
					resolver: new AnyResolver(
						module,
						new ChannelResolver(module, ChannelType.GUILD_TEXT),
						new StringResolver(module)
					),
					required: true,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD],
			examples: ['set #text', 'delete']
		});
	}

	public async execute(
		message: Message,
		[action, channel]: [Action, TextChannel | string],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		if (!settings.welcome.enabled) throw new ExecuteError(t('error.module.disabled'));

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			author: { name: t('welcome.title'), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});

		switch (action) {
			case Action.SET: {
				if (channel instanceof TextChannel) {
					settings.welcome.channelType = WelcomeChannelType.GUILD_CHANNEL;
					settings.welcome.channel = channel.id;

					embed.description = t('welcome.channel.set', {
						channel: channel.mention
					});
				} else if (/^(DM|ЛС|Личка|Личные сообщения)$/i.test(channel)) {
					settings.welcome.channelType = WelcomeChannelType.DM;
					settings.welcome.channel = null;

					embed.description = t('welcome.channel.dm');
				} else {
					throw new ExecuteError(t('welcome.channel.wrong'));
				}

				break;
			}

			case Action.DELETE: {
				settings.welcome.channelType = null;
				settings.welcome.channel = null;

				embed.description = t('welcome.channel.deleted');
				break;
			}

			default: {
				break;
			}
		}

		await settings.save();

		await this.replyAsync(message, embed);
	}
}

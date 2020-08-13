import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver, EnumResolver, ChannelResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Guild, User, Channel, TextChannel } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Enums/GuildPermissions';
import { AnyResolver } from '../../../Framework/Resolvers/AnyResolver';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { WelcomeChannelType } from '../../../Misc/Models/WelcomeTypes';

enum Action {
	ADD = 'add',
	DELETE = 'delete'
}

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome channel',
			aliases: [],
			args: [
				{
					name: 'add/delete',
					resolver: new EnumResolver(client, Object.values(Action))
				},
				{
					name: 'channel',
					resolver: new AnyResolver(client, ChannelResolver, StringResolver),
					full: true
				}
			],
			group: CommandGroup.WELCOME,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(
		message: Message,
		[action, channel]: [Action, TextChannel | string],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		const embed = this.createEmbed(
			{
				color: ColorResolve(Color.PRIMARY),
				title: t('welcome.title'),
				footer: {
					text: null
				}
			},
			false
		);

		switch (action) {
			case Action.ADD: {
				if (channel instanceof TextChannel) {
					settings.welcomeChannelType = WelcomeChannelType.GUILD_CHANNEL;
					settings.welcomeChannel = channel.id;

					embed.description = t('welcome.channel.set', {
						channel: channel.mention
					});
				} else if (/^(DM|ЛС|Личка|Личные сообщения)$/i.test(channel)) {
					settings.welcomeChannelType = WelcomeChannelType.DM;
					settings.welcomeChannel = null;

					embed.description = t('welcome.channel.dm');
				} else {
					throw new ExecuteError(t('welcome.channel.wrong'));
				}

				break;
			}

			case Action.DELETE: {
				settings.welcomeChannelType = null;
				settings.welcomeChannel = null;

				embed.description = t('welcome.channel.deleted');
				break;
			}

			default: {
				break;
			}
		}

		await settings.save();

		await this.replyAsync(message, t, embed);
	}
}

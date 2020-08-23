import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { EnumResolver, EmbedResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, TextChannel, EmbedOptions } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { WelcomeChannelType, WelcomeMessage } from '../../../Misc/Enums/WelcomeTypes';

enum Action {
	SET = 'set',
	DELETE = 'delete'
}

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome content',
			aliases: [],
			args: [
				{
					name: 'set/delete',
					resolver: new EnumResolver(client, Object.values(Action))
				},
				{
					name: 'message',
					resolver: EmbedResolver,
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
		[action, m]: [Action, EmbedOptions | string],
		{ funcs: { t, e }, guild, settings }: Context
	) {
		const embed = this.createEmbed(
			{
				color: ColorResolve(Color.MAGENTA),
				title: t('welcome.title'),
				footer: {
					text: null
				}
			},
			false
		);

		switch (action) {
			case Action.SET: {
				if (typeof m === 'string') {
					settings.welcomeMessageType = WelcomeMessage.TEXT;
					settings.welcomeMessage = m;
				} else {
					try {
						const embed = this.createEmbed(m, false);

						settings.welcomeMessageType = WelcomeMessage.EMBED;
						settings.welcomeMessage = JSON.stringify(embed);
					} catch (error) {
						throw new ExecuteError(
							t('error.embed.send', {
								error: error.message
									.split(/[\r?\n]/)
									.slice(1, 2)
									.join('\n')
							})
						);
					}
				}

				embed.description = t('welcome.message.ok');
				break;
			}

			case Action.DELETE: {
				settings.welcomeMessageType = null;
				settings.welcomeMessage = null;

				embed.description = t('welcome.message.deleted');
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

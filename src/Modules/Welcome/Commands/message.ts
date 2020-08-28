import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { EnumResolver, StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

enum Action {
	SET = 'set',
	DELETE = 'delete'
}

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome message',
			aliases: [],
			args: [
				{
					name: 'set/delete',
					resolver: new EnumResolver(client, Object.values(Action)),
					required: true
				},
				{
					name: 'message',
					resolver: StringResolver,
					required: true,
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

	public async execute(message: Message, [action, m]: [Action, string], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.welcomeEnabled !== true) throw new ExecuteError(t('error.module.disabled'));

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			author: { name: t('welcome.title'), icon_url: Images.SUCCESS },
			footer: null
		});

		switch (action) {
			case Action.SET: {
				settings.welcomeMessage = m.length < 1 ? null : m;
				embed.description = t('welcome.message.ok');
				break;
			}

			case Action.DELETE: {
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

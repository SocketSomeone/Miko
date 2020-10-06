import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { EnumResolver, StringResolver } from '../../../Framework/Resolvers';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

enum Action {
	SET = 'set',
	DELETE = 'delete'
}

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome message',
			aliases: [],
			args: [
				{
					name: 'set | delete',
					resolver: new EnumResolver(module, Object.values(Action)),
					required: true
				},
				{
					name: 'message',
					resolver: StringResolver,
					required: true,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD],
			examples: ['set {mention} joined to our server! ✨', 'delete']
		});
	}

	public async execute(message: Message, [action, m]: [Action, string], { funcs: { t, e }, guild, settings }: Context) {
		if (!settings.welcome.enabled) throw new ExecuteError(t('error.module.disabled'));

		const embed = this.createEmbed({
			color: Color.MAGENTA,
			author: { name: t('welcome.title'), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});

		switch (action) {
			case Action.SET: {
				settings.welcome.message = m.length < 1 ? null : m;
				embed.description = t('welcome.message.ok');
				break;
			}

			case Action.DELETE: {
				settings.welcome.message = null;
				embed.description = t('welcome.message.deleted');
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

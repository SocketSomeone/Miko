import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { StringResolver } from '../../../Framework/Resolvers';
import { EmojisDefault } from '../../../Misc/Enums/EmojisDefaults';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'setcurrency',
			aliases: [],
			args: [
				{
					name: 'emoji',
					resolver: StringResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD],
			examples: ['💸']
		});
	}

	public async execute(message: Message, [select]: [string], { funcs: { t, e }, guild, settings }: Context) {
		const emoji = e(select || EmojisDefault.WALLET);

		if (emoji === EmojisDefault.UNKNOWN_EMOJI) throw new ExecuteError(t('error.emoji.notFound'));

		if (emoji === settings.currency) throw new ExecuteError(t('error.changes.not'));

		settings.currency = emoji;
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: Images.SUCCESS
			},
			description: t(`configure.setcurrency`, { currency: settings.currency }),
			footer: null,
			timestamp: null
		});
	}
}

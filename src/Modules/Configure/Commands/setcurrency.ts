import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { StringResolver } from '../../../Framework/Resolvers';
import { EmojisDefault } from '../../../Misc/Enums/EmojisDefaults';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
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
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [emoji]: [string], { funcs: { t, e }, guild, settings }: Context) {
		const checked = e(emoji);

		if (emoji && checked === EmojisDefault.UNKNOWN_EMOJI) throw new ExecuteError(t('error.emoji.notFound'));

		settings.currency = emoji || EmojisDefault.WALLET;
		await settings.save();

		await this.replyAsync(message, t, {
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

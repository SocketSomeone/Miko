import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'prefix',
			aliases: ['префикс'],
			args: [
				{
					name: 'new-prefix',
					resolver: StringResolver,
					required: false
				}
			],
			group: CommandGroup.CONFIGURE,
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.MANAGE_GUILD],
			examples: ['m.']
		});
	}

	public async execute(message: Message, [prefix]: [string], { funcs: { t, e }, guild, settings }: Context) {
		if (prefix) {
			settings.prefix = prefix;
			await settings.save();
		}

		await this.replyAsync(message, t, {
			color: prefix ? Color.MAGENTA : Color.GRAY,
			author: {
				name: t('configure.title', { guild: guild.name }),
				icon_url: prefix ? Images.SUCCESS : Images.SETTINGS
			},
			description: t(`configure.prefix.${prefix ? 'new' : 'info'}`, { prefix: settings.prefix }),
			footer: null,
			timestamp: null
		});
	}
}

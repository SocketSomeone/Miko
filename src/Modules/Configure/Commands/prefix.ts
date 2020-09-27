import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { StringResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
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
			if (prefix === settings.prefix) throw new ExecuteError(t('error.changes.not'));

			settings.prefix = prefix;
			await settings.save();
		}

		await this.replyAsync(message, {
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

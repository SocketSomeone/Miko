import { BaseClient } from '../../../Client';
import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';
import { Cache } from '../../../Framework/Decorators/Cache';
import { GuildSettingsCache } from '../../../Framework/Cache';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'permissions clear',
			aliases: ['правила очистить'],
			group: CommandGroup.PERMISSIONS,
			args: [],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR]
		});
	}

	public async execute(message: Message, [], { funcs: { t }, guild, settings }: Context) {
		const permissions = settings.permissions;

		if (permissions.length < 1) throw new ExecuteError(t('perms.cleared'));

		settings.permissions = [];
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t('perms.title'), icon_url: Images.SUCCESS },
			description: t('perms.clear')
		});
	}
}

import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'log enable',
			aliases: [],
			group: CommandGroup.LOGS,
			args: [],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.VIEW_AUDIT_LOGS],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t }, guild, settings }: Context) {
		if (settings.welcomeEnabled) throw new ExecuteError(t('error.module.enable'));

		settings.loggerEnabled = true;
		await settings.save();

		await this.replyAsync(message, t, {
			author: { name: t(`others.module.enable`), icon_url: Images.SUCCESS },
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
		});
	}
}

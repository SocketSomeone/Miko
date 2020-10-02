import { Context, BaseCommand } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'log enable',
			aliases: [],
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

		await this.replyAsync(message, {
			author: { name: t(`others.module.enable`), icon_url: Images.SUCCESS },
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
		});
	}
}

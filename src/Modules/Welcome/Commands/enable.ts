import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { WelcomeRolesService } from '../Services/WelcomeRolesService';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Service } from '../../../Framework/Decorators/Service';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	@Service() protected roleService: WelcomeRolesService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome enable',
			aliases: [],
			args: [],
			group: CommandGroup.WELCOME,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.SEND_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, settings }: Context) {
		if (settings.welcomeEnabled) throw new ExecuteError(t('error.module.enable'));

		settings.welcomeEnabled = true;
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t(`others.module.enable`), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});
	}
}

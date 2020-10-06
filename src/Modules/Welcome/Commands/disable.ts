import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { WelcomeRolesService } from '../Services/WelcomeRolesService';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Service } from '../../../Framework/Decorators/Service';
import { WelcomeService } from '../Services/WelcomeService';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	@Service() protected roleService: WelcomeRolesService;
	@Service() protected messageService: WelcomeService;

	public constructor(module: BaseModule) {
		super(module, {
			name: 'welcome disable',
			aliases: [],
			args: [],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.SEND_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		if (!settings.welcome.enabled) throw new ExecuteError(t('error.module.disable'));

		settings.welcome.enabled = false;
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t(`others.module.disable`), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});
	}
}

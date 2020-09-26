import { Command, Context } from '../../../Framework/Services/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { RolesService } from '../Services/RolesService';
import { MessageService } from '../Services/MessageService';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	protected roleService: RolesService;
	protected messageService: MessageService;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome disable',
			aliases: [],
			args: [],
			group: CommandGroup.WELCOME,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.SEND_MESSAGES],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
		});

		this.roleService = new RolesService(client);
		this.messageService = new MessageService(client);
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		if (!settings.welcomeEnabled) throw new ExecuteError(t('error.module.disable'));

		settings.welcomeEnabled = false;
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t(`others.module.disable`), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});
	}
}

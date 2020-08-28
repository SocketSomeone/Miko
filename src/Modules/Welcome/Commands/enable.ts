import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { RolesService } from '../Services/RolesService';
import { MessageService } from '../Services/MessageService';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	protected roleService: RolesService;
	protected messageService: MessageService;

	public constructor(client: BaseClient) {
		super(client, {
			name: 'welcome enable',
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

	public async onLoaded() {
		await this.roleService.init();
		await this.messageService.init();
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		settings.welcomeEnabled = true;
		await settings.save();

		await this.replyAsync(message, t, {
			color: Color.MAGENTA,
			author: { name: t('welcome.title'), icon_url: Images.SUCCESS },
			description: t(`welcome.enable`),
			footer: null
		});
	}
}

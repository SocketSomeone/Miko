import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Member, Emoji } from 'eris';
import { BaseMember } from '../../../Entity/Member';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Color } from '../../../Misc/Enums/Colors';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { chance } from '../../../Misc/Utils/Chance';
import { BigIntResolver, BooleanResolver } from '../../../Framework/Resolvers';
import { RolesService } from '../Services/RolesService';
import { MessageService } from '../Services/MessageService';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

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
		settings.welcomeEnabled = false;
		await settings.save();

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('welcome.title', {
				guild: guild.name
			}),
			description: t('welcome.disable'),
			footer: {
				text: ''
			}
		});
	}
}

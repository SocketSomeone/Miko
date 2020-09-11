import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Commands/Command';
import { Message } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
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
		const permissions = await this.client.cache.permissions.get(guild);

		if (permissions.length < 1) throw new ExecuteError(t('perms.cleared'));

		await this.client.cache.permissions.save(guild.id, []);

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t('perms.title'), icon_url: Images.SUCCESS },
			description: t('perms.clear')
		});
	}
}

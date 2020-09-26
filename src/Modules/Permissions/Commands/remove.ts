import { BaseClient } from '../../../Client';
import { Context, Command } from '../../../Framework/Services/Commands/Command';
import { Message } from 'eris';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { NumberResolver } from '../../../Framework/Resolvers';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { Color } from '../../../Misc/Enums/Colors';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'permission remove',
			aliases: ['правило удалить'],
			group: CommandGroup.PERMISSIONS,
			args: [
				{
					name: 'number',
					resolver: new NumberResolver(client, 1),
					required: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			userPermissions: [GuildPermission.ADMINISTRATOR],
			examples: ['1']
		});
	}

	public async execute(message: Message, [index]: [number], { funcs: { t }, guild, settings }: Context) {
		const permissions = await this.client.cache.permissions.get(guild);

		if (typeof permissions[index - 1] === 'undefined') throw new ExecuteError(t('perms.notFound'));

		permissions.splice(index - 1, 1);
		await this.client.cache.permissions.save(guild.id, permissions);

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t('perms.title'), icon_url: Images.SUCCESS },
			description: t('perms.remove', {
				index
			})
		});
	}
}

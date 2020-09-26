import { Command, Context } from '../../../Framework/Services/Commands/Command';
import { BaseClient } from '../../../Client';
import { EnumResolver, ArrayResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { LogType } from '../Misc/LogType';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'log set',
			aliases: [],
			args: [
				{
					name: 'type',
					resolver: new ArrayResolver(client, new EnumResolver(client, Object.keys(LogType)), Object.keys(LogType)),
					required: false,
					full: true
				}
			],
			group: CommandGroup.LOGS,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.VIEW_AUDIT_LOGS],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD],
			examples: ['BAN', 'MESSAGE_DELETE, MESSAGE_EDITED']
		});
	}

	public async execute(message: Message, [types]: [LogType[]], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.loggerEnabled !== true) throw new ExecuteError(t('error.module.disabled'));

		const needToChange = types.filter((x) => settings.logger[x] !== message.channel.id);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.logger[type] = message.channel.id;
		}

		await settings.save();

		await this.replyAsync(message, {
			author: { name: t('logs.title'), icon_url: Images.SUCCESS },
			description: t(`logs.set`, {
				type: types.map((X) => `\`${X}\``).join(', ')
			}),
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
		});
	}
}

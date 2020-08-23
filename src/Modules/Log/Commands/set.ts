import { Command, Context } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { EnumResolver, ArrayResolver } from '../../../Framework/Resolvers';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { LogType } from '../Misc/LogType';
import { type } from 'os';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'log set',
			aliases: [],
			args: [
				{
					name: 'type',
					resolver: new ArrayResolver(client, new EnumResolver(client, Object.keys(LogType)), Object.keys(LogType)),
					required: false
				}
			],
			group: CommandGroup.LOGS,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.VIEW_AUDIT_LOGS],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD]
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

		await this.replyAsync(message, t, {
			color: ColorResolve(Color.MAGENTA),
			title: t('logs.title'),
			description: t(`logs.set`, {
				type: types.map((X) => `\`${X}\``).join(', ')
			}),
			footer: {
				text: ''
			}
		});
	}
}

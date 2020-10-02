import { BaseCommand, Context } from '../../../Framework/Commands/Command';
import { EnumResolver, ArrayResolver } from '../../../Framework/Resolvers';
import { Message } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { LogType } from '../Others/LogType';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'log unset',
			aliases: [],
			args: [
				{
					name: 'type',
					resolver: new ArrayResolver(module, new EnumResolver(module, Object.keys(LogType)), Object.keys(LogType)),
					required: false,
					full: true
				}
			],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.VIEW_AUDIT_LOGS],
			userPermissions: [GuildPermission.MANAGE_CHANNELS, GuildPermission.MANAGE_GUILD],
			examples: ['BAN', 'MESSAGE_DELETE, MESSAGE_EDITED']
		});
	}

	public async execute(message: Message, [types]: [LogType[]], { funcs: { t, e }, guild, settings }: Context) {
		if (settings.loggerEnabled !== true) throw new ExecuteError(t('error.module.disabled'));

		const needToChange = types.filter((x) => settings.logger[x] !== null);

		if (needToChange.length < 1) throw new ExecuteError(t('error.changes.not'));

		for (const type of needToChange) {
			settings.logger[type] = null;
		}

		await settings.save();

		await this.replyAsync(message, {
			author: { name: t('logs.title'), icon_url: Images.SUCCESS },
			description: t(`logs.unset`, {
				type: types.map((X) => `\`${X}\``).join(', ')
			}),
			color: Color.MAGENTA,
			footer: null,
			timestamp: null
		});
	}
}

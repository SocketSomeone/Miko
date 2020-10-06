import { BaseCommand, Context, TranslateFunc } from '../../../Framework/Commands/Command';
import { Message, Guild } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';
import { BaseModule } from '../../../Framework/Module';

export default class extends BaseCommand {
	public constructor(module: BaseModule) {
		super(module, {
			name: 'voice disable',
			aliases: ['v disable'],
			args: [],
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		settings.private.manager = await this.deleteManager(t, guild, settings.private.manager);
		await settings.save();

		await this.replyAsync(message, {
			color: Color.MAGENTA,
			author: { name: t(`others.module.disable`), icon_url: Images.SUCCESS },
			footer: null,
			timestamp: null
		});
	}

	protected async deleteManager(t: TranslateFunc, guild: Guild, c: string): Promise<null> {
		if (!c || !guild.channels.get(c)) throw new ExecuteError(t('error.module.disable'));

		const channel = guild.channels.get(c);
		channel.delete().catch(() => undefined);

		return null;
	}
}

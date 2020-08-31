import { Command, Context, TranslateFunc } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Guild } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';
import { Images } from '../../../Misc/Enums/Images';

export default class extends Command {
	public constructor(client: BaseClient) {
		super(client, {
			name: 'voice disable',
			aliases: ['v disable'],
			args: [],
			group: CommandGroup.VOICE,
			guildOnly: true,
			premiumOnly: false,
			botPermissions: [GuildPermission.MANAGE_CHANNELS],
			userPermissions: [GuildPermission.MANAGE_GUILD]
		});
	}

	public async execute(message: Message, [], { funcs: { t, e }, guild, settings }: Context) {
		settings.privateManager = await this.deleteManager(t, guild, settings.privateManager);
		await settings.save();

		await this.replyAsync(message, t, {
			color: Color.MAGENTA,
			author: { name: t('voice.title'), icon_url: Images.SUCCESS },
			description: t(`voice.disable`),
			footer: null
		});
	}

	protected async deleteManager(t: TranslateFunc, guild: Guild, c: string): Promise<null> {
		if (!c || !guild.channels.get(c)) throw new ExecuteError(t('error.module.disable'));

		const channel = guild.channels.get(c);
		channel.delete().catch(() => undefined);

		return null;
	}
}

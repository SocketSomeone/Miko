import { Command, Context, TranslateFunc } from '../../../Framework/Commands/Command';
import { BaseClient } from '../../../Client';
import { CommandGroup } from '../../../Misc/Models/CommandGroup';
import { Message, Guild } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';
import { ExecuteError } from '../../../Framework/Errors/ExecuteError';

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
			color: ColorResolve(Color.MAGENTA),
			title: t('voice.title'),
			description: t(`voice.disable`),
			footer: {
				text: ''
			}
		});
	}

	protected async deleteManager(t: TranslateFunc, guild: Guild, c: string): Promise<null> {
		if (!guild.channels.get(c)) throw new ExecuteError(t('voice.disabled'));

		const channel = guild.channels.get(c);
		channel.delete().catch(() => undefined);

		return null;
	}
}

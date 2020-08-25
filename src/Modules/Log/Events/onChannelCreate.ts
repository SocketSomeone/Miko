import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, User, GuildChannel } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onChannelCreateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.CHANNEL_CREATE);

		client.on('channelCreate', this.onHandle.bind(this));
	}

	public async onHandle(c: GuildChannel) {
		const guild = (c as GuildChannel).guild;

		if (!guild) {
			return;
		}

		await super.handleEvent(guild, c);
	}

	public async execute(t: TranslateFunc, guild: Guild, created: GuildChannel) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.chanCreate') },
			color: ColorResolve(Color.GREEN),
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${created}\``,
					inline: true
				}
			],
			footer: this.footer(created)
		});

		const entry = await this.getAuditLog(guild, created, Constants.AuditLogActions.CHANNEL_CREATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}
}

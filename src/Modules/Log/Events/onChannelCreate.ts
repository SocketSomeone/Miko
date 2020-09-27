import { BaseEventLog } from '../Others/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Others/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, GuildChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

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
		const embed = this.messages.createEmbed({
			author: { name: t('logs.chanCreate'), icon_url: Images.CHANNEL_CREATE },
			color: Color.LIME,
			fields: [
				{
					name: t('logs.channel'),
					value: created.mention,
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

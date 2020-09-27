import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, User, GuildChannel } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';
import { Cache } from '../../../Framework/Decorators/Cache';
import { RoomCache } from '../../Voice/Cache/RoomCache';

export default class onChannelDeleteEvent extends BaseEventLog {
	@Cache() protected rooms: RoomCache;

	public constructor(client: BaseClient) {
		super(client, LogType.CHANNEL_DELETE);

		client.on('channelDelete', this.onHandle.bind(this));
	}

	public async onHandle(c: GuildChannel) {
		const rooms = await this.rooms.get(c.guild);

		if (rooms.has(c.id)) return;

		await super.handleEvent(c.guild, c);
	}
	public async execute(t: TranslateFunc, guild: Guild, created: GuildChannel) {
		const embed = this.messages.createEmbed({
			author: { name: t('logs.chanDelete'), icon_url: Images.CHANNEL_DELETE },
			color: Color.RED,
			fields: [
				{
					name: t('logs.channel'),
					value: `\`${created.name}\``,
					inline: true
				}
			],
			footer: this.footer(created)
		});

		const entry = await this.getAuditLog(guild, created, Constants.AuditLogActions.CHANNEL_DELETE);

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

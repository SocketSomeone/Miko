import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Services/Commands/Command';
import { Guild, Constants, User } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onUnbanEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.UNBAN);

		client.on('guildBanRemove', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, user: User) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.unban'), icon_url: Images.UNBAN },
			color: Color.LIME,
			fields: [
				{
					name: t('logs.member'),
					value: user.tag,
					inline: true
				}
			],
			thumbnail: { url: user.avatarURL },
			footer: this.footer(user)
		});

		const entry = await this.getAuditLog(guild, user, Constants.AuditLogActions.MEMBER_BAN_REMOVE);

		if (entry) {
			embed.fields.push(
				...[
					{
						name: t('logs.reason'),
						value: entry.reason || 'No reason',
						inline: true
					},
					{
						name: t('logs.by'),
						value: entry.user.mention,
						inline: true
					}
				]
			);

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		return embed;
	}
}

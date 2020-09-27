import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onRoleCreateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.ROLE_CREATE);

		client.on('guildRoleCreate', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, role: Role) {
		const embed = this.messages.createEmbed({
			author: { name: t('logs.roleCreate'), icon_url: Images.ROLE_CREATE },
			color: Color.LIME,
			fields: [
				{
					name: t('logs.role'),
					value: role.mention,
					inline: true
				}
			],
			footer: this.footer(role)
		});

		const entry = await this.getAuditLog(guild, role, Constants.AuditLogActions.ROLE_CREATE);

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

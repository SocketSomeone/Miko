import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';

export default class onRoleCreateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.ROLE_CREATE);

		client.on('guildRoleCreate', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, role: Role) {
		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.roleCreate') },
			color: ColorResolve(Color.GREEN),
			fields: [
				{
					name: t('logs.role'),
					value: role.mention,
					inline: true
				}
			]
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

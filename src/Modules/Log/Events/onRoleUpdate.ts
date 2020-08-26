import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role } from 'eris';
import { ColorResolve } from '../../../Misc/Utils/ColorResolver';
import { Color } from '../../../Misc/Enums/Colors';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

const color = (dec: number) => {
	let color = dec.toString(16);
	return '#' + (color.length < 6 ? '0'.repeat(6 - color.length) + color : color).toUpperCase();
};

export default class onRoleUpdateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.ROLE_UPDATE);

		client.on('guildRoleUpdate', super.handleEvent.bind(this));
	}

	public async execute(t: TranslateFunc, guild: Guild, role: Role, oldRole: Role) {
		const compares = this.compare(role, oldRole);

		if (compares.length === 1 && compares.find((x) => x.key === 'position')) {
			return;
		}

		const embed = this.client.messages.createEmbed({
			author: { name: t('logs.roleUpdate') },
			color: ColorResolve(Color.YELLOW),
			fields: [
				{
					name: t('logs.role'),
					value: role.mention,
					inline: true
				}
			]
		});

		const entry = await this.getAuditLog(guild, role, Constants.AuditLogActions.ROLE_UPDATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		for (const compare of compares.sort((a, b) => a.key.localeCompare(b.key))) {
			let value = `\`${compare.old}\` => \`${compare.new}\``;

			if (compare.key === 'color') {
				value = `\`${color(Number(compare.old))}\` => \`${color(Number(compare.new))}\``;
			}

			embed.fields.push({
				name: t(`logs.${compare.key}`),
				value,
				inline: false
			});
		}

		const addedPermissions = Object.entries(role.permissions.json).filter(
			([key, val]) => oldRole.permissions.json[key] !== val
		);
		const deletedPermissions = Object.entries(oldRole.permissions.json).filter(
			([key, val]) => role.permissions.json[key] !== val
		);

		if (addedPermissions.length >= 1) {
			embed.fields.push({
				name: t('logs.permissionsAdded'),
				value: addedPermissions
					.map(([key, val]) => `\`${Object.entries(GuildPermission).find(([, val]) => val === key)[0]}\``)
					.join(', '),
				inline: true
			});
		}

		if (deletedPermissions.length >= 1) {
			embed.fields.push({
				name: t('logs.permissionsDeleted'),
				value: deletedPermissions
					.map(([key, val]) => `\`${Object.entries(GuildPermission).find(([, val]) => val === key)[0]}\``)
					.join(', '),
				inline: true
			});
		}

		return embed;
	}
}

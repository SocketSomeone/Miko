import { BaseEventLog } from '../Misc/EventLog';
import { BaseClient } from '../../../Client';
import { LogType } from '../Misc/LogType';
import { TranslateFunc } from '../../../Framework/Commands/Command';
import { Guild, Constants, Role, Member } from 'eris';
import { Color } from '../../../Misc/Enums/Colors';
import { Images } from '../../../Misc/Enums/Images';

export default class onMemberRolesUpdateEvent extends BaseEventLog {
	public constructor(client: BaseClient) {
		super(client, LogType.MEMBER_UPDATE_ROLES);

		client.on('guildMemberUpdate', this.onHandle.bind(this));
	}

	private async onHandle(guild: Guild, member: Member, oldMember: { roles: string[]; nickname?: string }) {
		if (!oldMember) return;

		if (member.roles.length !== oldMember.roles.length) {
			await super.handleEvent(guild, member, oldMember.roles);
		}

		return;
	}

	public async execute(t: TranslateFunc, guild: Guild, member: Member, oldRoles: string[]) {
		const embed = this.messages.createEmbed({
			author: { name: t('logs.memberRolesUpdate'), icon_url: Images.MEMBER_UPDATE },
			color: Color.YELLOW,
			fields: [
				{
					name: t('logs.member'),
					value: member.mention,
					inline: true
				}
			],
			thumbnail: { url: member.avatarURL },
			footer: this.footer(member)
		});

		const entry = await this.getAuditLog(guild, member, Constants.AuditLogActions.MEMBER_ROLE_UPDATE);

		if (entry) {
			embed.fields.push({
				name: t('logs.by'),
				value: entry.user.mention,
				inline: true
			});

			embed.thumbnail = { url: entry.user.avatarURL };
		}

		const addedRole = member.roles.find((r) => !oldRoles.includes(r));
		const deletedRole = oldRoles.find((r) => !member.roles.includes(r));

		if (addedRole) {
			embed.fields.push({
				name: t('logs.addedRoles'),
				value: `<@&${addedRole}>`,
				inline: true
			});
		}

		if (deletedRole) {
			embed.fields.push({
				name: t('logs.deletedRoles'),
				value: `<@&${deletedRole}>`,
				inline: true
			});
		}

		return embed;
	}
}

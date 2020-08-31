import { BaseService } from '../../../Framework/Services/Service';
import { BaseMember } from '../../../Entity/Member';
import { Guild, Member } from 'eris';
import { GuildPermission } from '../../../Misc/Models/GuildPermissions';

export class RolesService extends BaseService {
	public async init() {
		this.client.on('guildMemberAdd', this.returnRoles.bind(this));
		this.client.on('guildMemberRemove', this.saveRoles.bind(this));
	}

	public async returnRoles(guild: Guild, member: Member) {
		if (member.user.bot) return;

		const settings = await this.client.cache.guilds.get(guild);
		const roles: string[] = [];

		if (!settings.welcomeEnabled) {
			return;
		}

		const me = guild.members.get(this.client.user.id);

		if (!me.permission.has(GuildPermission.MANAGE_ROLES)) {
			console.log(`TRYING TO SET JOIN ROLES IN ${guild.id} WITHOUT MANAGE_ROLES PERMISSION`);
			return;
		}

		if (settings.welcomeSaveRoles) {
			const person = await BaseMember.get(member);

			if (person.savedRoles && person.savedRoles.length > 0) {
				roles.push(...person.savedRoles);
			}
		}

		roles.push(...settings.onWelcomeRoles);

		if (roles && roles.length >= 1) {
			await member.edit(
				{
					roles: this.client.moderation.editableRoles(guild, roles, me).map((x) => x.id)
				},
				'Auto Assign Role OR Saved Roles'
			);
		}
	}

	public async saveRoles(guild: Guild, member: Member) {
		if (member.user.bot) return;

		const settings = await this.client.cache.guilds.get(guild);

		if (!settings.welcomeEnabled || !settings.welcomeSaveRoles) return;

		const person = await BaseMember.get(member);
		person.savedRoles = member.roles;

		await person.save();
	}
}

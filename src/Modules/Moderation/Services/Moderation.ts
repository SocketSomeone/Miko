import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member } from 'eris';

export class ModerationService extends BaseService {
	public getHighestRole(guild: Guild, roles: string[]): Role {
		return roles
			.map((role) => guild.roles.get(role))
			.filter((role) => !!role)
			.reduce((prev, role) => (role.position > prev.position ? role : prev), {
				position: -1
			} as Role);
	}

	public getHoistRole(guild: Guild, roles: string[]): Role {
		return roles
			.map((role) => guild.roles.get(role))
			.filter((role) => !!role)
			.reduce((prev, role) => (role.position < prev.position ? role : prev), {
				position: -1
			} as Role);
	}

	public editableRoles(guild: Guild, roles: string[], me: Member): Role[] {
		const highestBotRole = this.getHighestRole(guild, me.roles);

		return roles.map((r) => guild.roles.get(r)).filter((r) => !!r && highestBotRole.position > r.position);
	}

	public isPunishable(guild: Guild, targetMember: Member, authorMember: Member, me: Member) {
		const highestBotRole = this.getHighestRole(guild, me.roles);
		const highestMemberRole = this.getHighestRole(guild, targetMember.roles);
		const highestAuthorRole = this.getHighestRole(guild, authorMember.roles);

		return (
			targetMember.id !== guild.ownerID &&
			targetMember.id !== me.user.id &&
			highestBotRole.position > highestMemberRole.position &&
			highestAuthorRole.position > highestMemberRole.position
		);
	}
}

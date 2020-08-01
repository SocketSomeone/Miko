import { BaseService } from '../../../Framework/Services/Service';
import { Guild, Role, Member, Message } from 'eris';
import { keyword } from 'chalk';
import { GuildSettings } from '../../../Misc/Models/GuildSetting';
import { Punishment } from '../../../Entity/Punishment';

interface Arguments {
	guild: Guild;
	settins: GuildSettings;
}

type PunishmentFunctions = {
	[key in Punishment]: (message: Message, amount: number, args: Arguments) => Promise<boolean>;
};

export class ModerationService extends BaseService {
	// private punishFuncs: PunishmentFunctions = {

	// };

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

	public isEditableRole(role: Role, highest: Role) {
		return highest.position > role.position;
	}

	public editableRoles(guild: Guild, roles: string[], me: Member): Role[] {
		const highestBotRole = this.getHighestRole(guild, me.roles);

		return roles.map((r) => guild.roles.get(r)).filter((r) => !!r && this.isEditableRole(r, highestBotRole));
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

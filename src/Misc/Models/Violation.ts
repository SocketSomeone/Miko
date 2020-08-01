import { Punishment } from '../../Entity/Punishment';

export enum Violation {
	invites = 'Sending Invites'
	// links = 'links',
	// words = 'words',
	// allCaps = 'allCaps',
	// duplicateText = 'duplicateText',
	// quickMessages = 'quickMessages',
	// mentionUsers = 'mentionUsers',
	// mentionRoles = 'mentionRoles',
	// emojis = 'emojis',
	// hoist = 'hoist'
}

export class PunishmentConfig {
	public id: number;
	public type: Punishment;
	public amount: number;
	public args: string;
}

import { Punishment } from '../../Entity/Punishment';

export enum Violation {
	invites = 'invites',
	allCaps = 'caps',
	duplicateText = 'duplicate',
	zalgo = 'zalgo',
	emojis = 'emojis',
	externalLinks = 'exlinks',
	mentions = 'mentions'
}

export class PunishmentConfig {
	public id: number;
	public type: Punishment;
	public amount: number;
	public args: string;
}

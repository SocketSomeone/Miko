export enum PermissionsFrom {
	User,
	Channel,
	Role,
	Server
}

export enum PermissionsExecute {
	Command,
	Module,
	AllModules = '*'
}

export interface Permission {
	addedAt: Date;
	index: number;
	activator: PermissionsFrom;
	activatorId: string;
	target: PermissionsExecute;
	targetId: string;
	value: boolean;
}

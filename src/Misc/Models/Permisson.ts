export enum Activator {
	User,
	Channel,
	Role,
	Server
}

export enum Target {
	Command,
	Module,
	AllModules = '*'
}

export interface PermissionsActivator {
	id: string;
	type: Activator;
}

export interface PermissionsTarget {
	id: string;
	type: Target;
}

export interface Permission {
	index: number;

	activator: PermissionsActivator;
	target: PermissionsTarget;

	allow: boolean;
}

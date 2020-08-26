import { CommandGroup } from './CommandGroup';

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

export interface PermissionsActivator {
	id: string;
	type: PermissionsFrom;
}

export interface PermissionsTarget {
	id: string | CommandGroup;
	type: PermissionsExecute;
}

export interface Permission {
	index: number;

	activator: PermissionsActivator;
	target: PermissionsTarget;

	allow: boolean;
}

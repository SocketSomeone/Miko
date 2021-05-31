import type { Constructor } from '@miko/common';
import type { PermissionResolvable } from 'discord.js';
import type { BaseArgument } from './models';

export type ArgumentOrConstructor<T> = BaseArgument<T> | Constructor<BaseArgument<T>>;

export interface ICommandArgument {
	name: string;
	argument: BaseArgument<unknown>;
	optional?: boolean;
	remaining?: boolean;
}

export interface ICommandOptionsArgument {
	name: string;
	argument: ArgumentOrConstructor<unknown>;
	optional?: boolean;
	remaining?: boolean;
}

export interface ICommandOptions {
	name: string;
	group?: string;
	hidden?: boolean;
	onlyGuild?: boolean;
	onlyPremium?: boolean;
	arguments?: ICommandOptionsArgument[];
	permissions?: PermissionResolvable[];
}

export interface IParsedMessageData {
	key?: string;
	content?: string;
}

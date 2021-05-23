import type { Constructor } from '@miko/types';
import type { PermissionResolvable } from 'discord.js';
import type { BaseResolver } from './models';

export type ResolverOrConstructor<T> = BaseResolver<T> | Constructor<BaseResolver<T>>;

export interface ICommandArgument {
	name: string;
	resolver: BaseResolver<unknown>;
	optional?: boolean;
	remaining?: boolean;
}

export interface ICommandOptionsArgument {
	name: string;
	resolver: ResolverOrConstructor<unknown>;
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

import type { Constructor } from '@miko/utils';
import type { Message, PermissionResolvable } from 'discord.js';
import type { Command, Resolver } from './framework';

export type ResolverOrConstructor<T> = Resolver<T> | Constructor<Resolver<T>>;

export type GuardFunction = (message: Message) => boolean;

export interface ICommandArgument {
	name: string;
	resolver: Resolver<unknown>;
	optional?: boolean;
}

export interface ICommandOptionsArgument {
	name: string;
	resolver: ResolverOrConstructor<unknown>;
	optional?: boolean;
}

export interface ICommandOptions {
	name: string;
	group?: string;

	arguments?: ICommandOptionsArgument[];
	guards?: GuardFunction[];

	clientPermissions?: PermissionResolvable[];
	userPermissions?: PermissionResolvable[];

	cooldown?: number;
	ratelimit?: number;

	typing?: boolean;
}
export interface IParsedCommandData {
	afterPrefix?: string;
	alias?: string;
	command?: Command;
	content?: string;
	prefix?: string;
}

import { Constructor } from '@miko/utils';
import { Message, PermissionResolvable } from 'discord.js';
import { MiCommand } from './commands';
import { MiResolver } from './resolvers/resolver';

export type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;

export type GuardFunction = (message: Message) => boolean;

export interface ICommandArgument {
	name: string;
	resolver: ResolverOrConstructor<unknown>;
	optional?: boolean;
	afterContain?: boolean;
}

export interface ICommandOptions {
	name: string;
	group?: string;

	arguments?: ICommandArgument[];
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
	command?: MiCommand;
	content?: string;
	prefix?: string;
}

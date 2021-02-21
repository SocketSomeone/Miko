import { Constructor } from '@miko/utils';
import { Message } from 'discord.js';
import { MiResolver } from './resolvers/resolver';

export type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;

export type GuardFunction = (message: Message) => boolean;

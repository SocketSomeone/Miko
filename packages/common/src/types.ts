import { Constructor } from '@miko/utils';
import { MiResolver } from '.';

export type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;

export type GuardFunction = () => boolean;

import { MiResolver } from '.';

export type AllowArray<T> = T | T[];

export type Constructor<T> = new (...args: unknown[]) => T;

export type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;

export type GuardFunction = () => boolean;
export interface IMikoMetrics {
    shardConnects: number;
    shardDisconnects: number;
    shardResumes: number;
    wsWarnings: number;
    wsErrors: number;
    ratelimits: number;
    startedAt?: Date;
}


import { ClientOptions } from 'discord.js';
import { MiResolver, MiModule } from '.';

export type AllowArray<T> = T | T[];

export type Constructor<T> = new (...args: unknown[]) => T;

export type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;

export interface IClientOptionsExtend {
    modules: Constructor<MiModule>[]
}

export type MikoClientOptions = ClientOptions & IClientOptionsExtend;

export interface IMikoMetrics {
    shardConnects: number;
    shardDisconnects: number;
    shardResumes: number;
    wsWarnings: number;
    wsErrors: number;
    ratelimits: number;
    startedAt: Date | null;
}
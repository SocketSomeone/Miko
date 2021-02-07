import { Message } from 'discord.js';
import { MiResolver, MiService } from '.';
export declare type AllowArray<T> = T | T[];
export declare type Constructor<T> = new (...args: unknown[]) => T;
export declare type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;
export declare type MikoClientOptions = {
    services: Constructor<MiService>[];
    modules: string;
};
export interface ICanActivate {
    canActivate(message: Message): boolean | Promise<boolean>;
}
export interface IMikoMetrics {
    shardConnects: number;
    shardDisconnects: number;
    shardResumes: number;
    wsWarnings: number;
    wsErrors: number;
    ratelimits: number;
    startedAt?: Date;
}
//# sourceMappingURL=types.d.ts.map
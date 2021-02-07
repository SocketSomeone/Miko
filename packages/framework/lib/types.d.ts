import { MiResolver } from '.';
export declare type AllowArray<T> = T | T[];
export declare type Constructor<T> = new (...args: unknown[]) => T;
export declare type ResolverOrConstructor<T> = MiResolver<T> | Constructor<MiResolver<T>>;
export declare type GuardFunction = () => boolean;
export interface IMikoMetrics {
    shardConnects: number;
    shardDisconnects: number;
    shardResumes: number;
    wsWarnings: number;
    wsErrors: number;
    ratelimits: number;
    startedAt?: Date;
}
export declare const arrarify: <T>(value: AllowArray<T>) => T[];
//# sourceMappingURL=types.d.ts.map
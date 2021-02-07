import { Logger } from '@miko/logger';
import { CacheMetrics } from './metrics';
import { ICacheEntry, ICacheOptions } from './types';
export declare abstract class MiCache<V = unknown, K = string> {
    protected readonly logger: Logger;
    protected readonly storage: Map<K, ICacheEntry<V>>;
    protected readonly pending: Map<K, Promise<V>>;
    metrics: CacheMetrics;
    private maxSize;
    private expireAfter;
    private refreshAfter;
    constructor({ maxSize, expireAfter, refreshAfter, checkInterval }?: ICacheOptions);
    init(): Promise<void>;
    set(key: K, value: V, ttl?: ICacheOptions['expireAfter'], ref?: ICacheOptions['refreshAfter']): Promise<void>;
    get(key: K): Promise<V | undefined>;
    delete(key: K): Promise<boolean>;
    clear(): Promise<void>;
    protected abstract load(key: K): Promise<V>;
    private tryLoad;
    private checkCache;
}
//# sourceMappingURL=cache.d.ts.map
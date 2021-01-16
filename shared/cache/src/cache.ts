import { EventEmitter } from "events";
import moment from "moment";
import { duration } from "moment";
import { CacheMetrics } from "./metrics";
import { ICacheEntry, ICacheEvents, ICacheOptions } from "./types";

class Cache<V = any, K = string> extends EventEmitter {
    protected readonly storage: Map<K, ICacheEntry<V>> = new Map();
    protected readonly pending: Map<K, Promise<V>> = new Map();

    public metrics = new CacheMetrics();

    private maxSize     : ICacheOptions<K, V>['maxSize'];
    private expireAfter : ICacheOptions<K, V>['expireAfter'];
    private refreshAfter: ICacheOptions<K, V>['refreshAfter'];
    private loadFunc    : ICacheOptions<K, V>['load'];

    public constructor({
        maxSize       = 1000,
        checkInterval = 250,
        expireAfter   = duration(6, 'hours'),
        refreshAfter  = duration(6, 'hours'),
        load          = undefined
    }: ICacheOptions<K, V>) {
        super();

        this.maxSize      = maxSize;
        this.expireAfter  = expireAfter;
        this.refreshAfter = refreshAfter;
        this.loadFunc     = load;

        setInterval(this.checkCache.bind(this), checkInterval);
    }

    public async set(
        key  : K,
        value: V,
        ttl  : ICacheOptions<K, V>['expireAfter'] = this.expireAfter
    ): Promise<void> {
        this.emit('update', key, value);

        if (this.storage.size >= this.maxSize) {
            this.metrics.evictions++;

            const iter  = [...this.storage.entries()];
            const sort  = iter.sort(([, a], [, b]) => a.addedAt.unix() - b.addedAt.unix());
            const [key] = sort[0];

            this.delete(key);
        } 

        this.storage.set(key, {
            data: value,
            addedAt: moment(),
            expires: moment().add(ttl),
            refresh: moment().add(this.refreshAfter)
        });
    }

    public async get(key: K): Promise<V | undefined> {
        if (this.storage.has(key)) {
            const { data, expires, refresh } = this.storage.get(key);
            const curTime = moment();
            
            this.metrics.hits++;

            if (curTime.isAfter(refresh)) {
                return this.load(key);
            };
            
            if (curTime.isBefore(expires)) {
                return data;
            };
        };

        return this.load(key);
    }

    public async delete(key: K): Promise<boolean> {
        this.emit('deleted', key);

        return this.storage.delete(key);
    }

    public async clear(): Promise<void> {
        this.emit('cleared');

        return this.storage.clear();
    }

    private async load(key: K) {
        if (typeof this.loadFunc !== 'undefined') {
            const res = this.pending.get(key);

            if (res) {
                return res;
            }

            const promise = this.loadFunc(key)
                .then((obj) => {
                    this.metrics.loadSuccess++;

                    return obj;
                })
                .catch(() => {
                    this.metrics.loadError++;
                    this.metrics.misses++;

                    return undefined;
                })
                .finally(() => this.pending.delete(key));

            this.pending.set(key, promise);
            const obj = await promise;

            this.set(key, obj);

            return obj;
        }

        this.metrics.misses++;

        return undefined;
    }

    private async checkCache() {

    }
}


interface Cache<V, K> {
    on<E extends keyof ICacheEvents<K, V>>(
        event: E, listener: (...args: ICacheEvents<K, V>[E]) => void
    ): this;

    emit<E extends keyof ICacheEvents<K, V>>(
        event: E, ...args: ICacheEvents<K, V>[E]
    ): boolean;
}

export default Cache;
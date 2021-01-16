import * as moment from 'moment';
import { EventEmitter } from 'events';
import { duration } from 'moment';
import { CacheMetrics } from './metrics';
import { ICacheEntry, ICacheOptions } from './types';

export class Cache<V = unknown, K = string> extends EventEmitter {
    protected readonly storage: Map<K, ICacheEntry<V>> = new Map();

    protected readonly pending: Map<K, Promise<V>> = new Map();

    public metrics = new CacheMetrics();

    private maxSize: ICacheOptions<K, V>['maxSize'];

    private expireAfter: ICacheOptions<K, V>['expireAfter'];

    private refreshAfter: ICacheOptions<K, V>['refreshAfter'];

    private loadFunc: ICacheOptions<K, V>['load'];

    public constructor({
        maxSize = 1000,
        // checkInterval = 250,
        expireAfter = duration(6, 'hours'),
        refreshAfter = duration(6, 'hours'),
        load = undefined
    }: ICacheOptions<K, V> = {}) {
        super();

        this.maxSize = maxSize;
        this.expireAfter = expireAfter;
        this.refreshAfter = refreshAfter;
        this.loadFunc = load;

        // TODO: Added interval check expiring keys
        // setInterval(this.checkCache.bind(this), checkInterval);
    }

    public async set(
        key: K,
        value: V,
        ttl: ICacheOptions<K, V>['expireAfter'] = this.expireAfter,
        ref: ICacheOptions<K, V>['refreshAfter'] = this.refreshAfter
    ): Promise<void> {
        this.emit('update', key, value);

        if (this.maxSize && this.storage.size >= this.maxSize) {
            this.metrics.evictions += 1;

            const iter = [...this.storage.entries()];
            const sort = iter.sort(([, a], [, b]) => a.addedAt.unix() - b.addedAt.unix());
            const [iterKey] = sort[0];

            this.delete(iterKey);
        }

        this.storage.set(key, {
            data: value,
            addedAt: moment(),
            expires: typeof ttl === 'undefined' ? null : moment().add(ttl),
            refresh: typeof ref === 'undefined' ? null : moment().add(ref)
        });
    }

    public async get(key: K): Promise<V | undefined> {
        const entry = this.storage.get(key);

        if (entry) {
            const curTime = moment();

            this.metrics.hits += 1;

            if (entry.refresh && curTime.isAfter(entry.refresh)
                ||
                entry.expires && curTime.isAfter(entry.expires)
            ) return this.load(key);

            return entry.data;
        }

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
        if (typeof this.loadFunc === 'undefined') {
            this.metrics.misses += 1;

            return undefined;
        }

        try {
            const res = this.pending.get(key);

            if (res) {
                return res;
            }

            const promise = this.loadFunc(key)
                .finally(() => this.pending.delete(key));

            this.pending.set(key, promise);
            const obj = await promise;

            this.set(key, obj);

            this.metrics.loadSuccess += 1;

            return obj;
        } catch (err) {
            this.metrics.loadError += 1;
            this.metrics.misses += 1;

            return undefined;
        }
    }

    // private async checkCache() {
    // sconsole.log('NO-OP')
    // }
}
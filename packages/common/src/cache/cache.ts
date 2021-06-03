import { duration } from 'moment';
import { arrarify } from '../utils';
import { MetricsCache, MetadataCache } from '../models';
import type { ICacheEntry, ICacheOptions, AllowArray } from '../types';

export class LoadingCache<V = unknown, K = string> {
	public readonly metrics = new MetricsCache();

	private readonly pending: Map<K, Promise<V>> = new Map();

	private readonly maxSize!: number;

	private readonly expireAfter!: number;

	private readonly refreshAfter!: number;

	private readonly load!: ICacheOptions<K, V>['load'];

	private storage: Map<K, ICacheEntry<V>> = new Map();

	public constructor({
		maxSize = 100,
		expireAfter = duration(6, 'hours'),
		refreshAfter = duration(2, 'hours'),
		cleanupInterval = 5000,
		refreshInterval = 15000,
		load = null
	}: ICacheOptions<K, V> = {}) {
		this.load = load;
		this.maxSize = maxSize;
		this.expireAfter = expireAfter.asMilliseconds();
		this.refreshAfter = refreshAfter.asMilliseconds();

		if (cleanupInterval) {
			setInterval(this.cleanup.bind(this), cleanupInterval);
		}

		if (refreshInterval) {
			setInterval(this.refreshAll.bind(this), refreshInterval);
		}
	}

	public set(key: K, value: V): void {
		this.storage.set(key, {
			data: value,
			meta: new MetadataCache()
		});

		this.evictBySize();
	}

	public async get(key: K, loader?: ICacheOptions<K, V>['load']): Promise<null | V> {
		if (this.has(key)) {
			const { meta, data } = this.storage.get(key);

			if (meta.diff() <= this.expireAfter) {
				// meta.use();
				this.metrics.hits += 1;
				return data;
			}

			this.remove(key);
		}

		this.metrics.misses += 1;
		return this.refresh(key, loader);
	}

	public async refresh(key: K, loader?: ICacheOptions<K, V>['load']): Promise<null | V> {
		const load: ICacheOptions<K, V>['load'] = loader ?? this.load;

		if (typeof load !== 'function') {
			return null;
		}

		try {
			const resolve = this.pending.get(key);

			if (resolve) {
				return resolve;
			}

			const promise = this.load(key).finally(() => this.pending.delete(key));
			this.pending.set(key, promise);

			const value = await promise;

			this.set(key, value);
			return value;
		} catch (err) {
			this.metrics.loadError += 1;
		}

		return null;
	}

	public delete(rawKeys: AllowArray<K>): void {
		const keys = arrarify(rawKeys);

		for (const key of keys) {
			this.remove(key);
		}
	}

	private remove(key: K): void {
		if (!this.has(key)) {
			return;
		}

		this.storage.delete(key);
	}

	public find(fn: (v: ICacheEntry<V>, k: K) => boolean): V {
		const array = [...this.storage.entries()];
		const [, item] = array.find(([key, value]) => fn(value, key));

		return item.data;
	}

	public filter(fn: (v: ICacheEntry<V>, k: K) => boolean): Map<K, ICacheEntry<V>> {
		const array = [...this.storage.entries()];
		const filtered = array.filter(([key, value]) => fn(value, key));

		return new Map(filtered);
	}

	public has(key: K): boolean {
		return this.storage.has(key);
	}

	public cleanup(): void {
		this.evictByTime();
		this.evictBySize();
	}

	public flush(): void {
		this.storage = new Map();
	}

	private evictByTime() {
		const expiredKeys = [...this.filter(({ meta }) => meta.diff() > this.expireAfter).keys()];

		this.metrics.evictions += expiredKeys.length;
		this.delete(expiredKeys);
	}

	private evictBySize() {
		if (this.size <= this.maxSize) {
			return;
		}

		const count = this.size - this.maxSize - 1;
		const keys = [...this.storage.keys()].slice(0, count);

		this.metrics.evictions += keys.length;
		this.delete(keys);
	}

	private refreshAll() {
		const expired = this.filter(({ meta }) => meta.diff() > this.refreshAfter);

		for (const [key] of expired) {
			this.refresh(key);
		}
	}

	public get size(): number {
		return this.storage.size;
	}

	public toJSON(): unknown {
		return this.metrics.toJSON();
	}

	public toString(): string {
		return this.metrics.toString();
	}
}

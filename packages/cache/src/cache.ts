import { duration } from 'moment';
import type { AllowArray } from '@miko/types';
import { arrarify } from '@miko/types';
import { MetricsCache } from './meta/metrics';
import type { ICacheEntry, ICacheOptions } from './types';
import { MetadataCache } from './meta/metadata';

export class LoadingCache<V = unknown, K = string> {
	public readonly metrics = new MetricsCache();

	private readonly pending: Map<K, Promise<V>> = new Map();

	private readonly maxSize: number;

	private readonly expireAfter: number;

	private readonly refreshAfter: number;

	private readonly load: ICacheOptions<K, V>['load'];

	private storage: Map<K, ICacheEntry<V>> = new Map();

	public constructor({
		maxSize = 100,
		expireAfter = duration(6, 'hours'),
		refreshAfter = duration(10, 'hours'),
		cleanupInterval = 1000,
		refreshInterval = 15000,
		load = undefined
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
				this.metrics.hits += 1;
				meta.use();

				return data;
			}

			this.remove(key, 'expiry');
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
				return await resolve;
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
			this.remove(key, 'explicit');
		}
	}

	private remove(key: K, reason: string): void {
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
		const expired = this.filter(({ meta }) => meta.diff() > this.expireAfter);

		for (const [key] of expired) {
			this.remove(key, 'expiry');
			this.metrics.evictions += 1;
		}
	}

	private evictBySize() {
		if (this.size <= this.maxSize) {
			return;
		}

		const count = this.size - this.maxSize - 1;
		const keys = [...this.storage.keys()].slice(0, count);

		for (const key of keys) {
			this.remove(key, 'size');
			this.metrics.evictions += 1;
		}
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

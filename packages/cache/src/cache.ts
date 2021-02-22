import moment, { duration, Moment } from 'moment';
import { TypeSafeEmitter } from '@miko/utils';
import { MetricsCache } from './meta/metrics';
import { ICacheEntry, ICacheEvents, ICacheOptions } from './types';

export class MiCache<K = string, V = unknown> extends TypeSafeEmitter<ICacheEvents<K, V>> {
	protected readonly storage: Map<K, ICacheEntry<V>> = new Map();

	protected readonly pending: Map<K, Promise<V>> = new Map();

	public metrics = new MetricsCache();

	private maxSize: ICacheOptions<K, V>['maxSize'];

	private expireAfter: ICacheOptions<K, V>['expireAfter'];

	private refreshAfter: ICacheOptions<K, V>['refreshAfter'];

	private load: ICacheOptions<K, V>['load'];

	public constructor({
		maxSize = 50,
		expireAfter = duration(6, 'hours'),
		refreshAfter = undefined,
		checkInterval = 1000,
		load = undefined
	}: ICacheOptions<K, V> = {}) {
		super();

		this.maxSize = maxSize;
		this.expireAfter = expireAfter;
		this.refreshAfter = refreshAfter;
		this.load = load;

		if (checkInterval) {
			setInterval(this.checkCache.bind(this), checkInterval);
		}
	}

	public async set(
		key: K,
		value: V,
		ttl: ICacheOptions<K, V>['expireAfter'] = this.expireAfter,
		ref: ICacheOptions<K, V>['refreshAfter'] = this.refreshAfter
	): Promise<void> {
		if (this.maxSize && this.storage.size >= this.maxSize) {
			this.metrics.evictions += 1;

			let olderTime: Moment;
			let olderKey: K;

			for (const [iterKey, iterVal] of this.storage) {
				if (!olderKey) {
					olderKey = iterKey;
					olderTime = iterVal.addedAt;

					continue;
				}

				if (!iterVal.addedAt || (olderTime && olderTime.isBefore(iterVal.addedAt))) continue;

				olderKey = iterKey;
				olderTime = iterVal.addedAt;
			}

			if (olderKey) {
				this.delete(olderKey);
			}
		}

		this.storage.set(key, {
			data: value,
			addedAt: moment(),
			expires: ttl ? moment().add(ttl) : null,
			refresh: ref ? moment().add(ref) : null
		});
	}

	public async get(key: K): Promise<V | undefined> {
		const entry = this.storage.get(key);

		if (entry) {
			const curTime = moment();

			this.metrics.hits += 1;

			if ((entry.refresh && curTime.isAfter(entry.refresh)) || (entry.expires && curTime.isAfter(entry.expires))) {
				return this.tryLoad(key);
			}

			return entry.data;
		}

		return this.tryLoad(key);
	}

	public async delete(key: K): Promise<boolean> {
		return this.storage.delete(key);
	}

	public async clear(): Promise<void> {
		return this.storage.clear();
	}

	private async tryLoad(key: K) {
		try {
			const res = this.pending.get(key);

			if (res) {
				return res;
			}

			const promise = this.load(key).finally(() => this.pending.delete(key));

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

	private checkCache() {
		const curTime = moment();

		for (const [key, entry] of this.storage) {
			if (entry.refresh && curTime.isBefore(entry.refresh)) {
				this.tryLoad(key);
			}

			if (entry.expires && curTime.isBefore(entry.expires)) {
				this.delete(key);
			}
		}
	}
}

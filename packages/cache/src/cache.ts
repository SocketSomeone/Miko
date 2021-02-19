import { Logger } from 'tslog';
import moment, { duration } from 'moment';
import { CacheMetrics } from './metrics';
import { ICacheEntry, ICacheOptions } from './types';

export abstract class MiCache<V = unknown, K = string> {
	protected readonly logger: Logger = new Logger({ name: this.constructor.name });

	protected readonly storage: Map<K, ICacheEntry<V>> = new Map();

	protected readonly pending: Map<K, Promise<V>> = new Map();

	public metrics = new CacheMetrics();

	private maxSize: ICacheOptions['maxSize'];

	private expireAfter: ICacheOptions['expireAfter'];

	private refreshAfter: ICacheOptions['refreshAfter'];

	public constructor({
		maxSize = 50,
		expireAfter = duration(6, 'hours'),
		refreshAfter = undefined,
		checkInterval = 1000
	}: ICacheOptions = {}) {
		this.maxSize = maxSize;
		this.expireAfter = expireAfter;
		this.refreshAfter = refreshAfter;

		if (checkInterval) {
			setInterval(this.checkCache.bind(this), checkInterval);
		}
	}

	public async init(): Promise<void> {
		this.logger.silly('Cache initialized..');
	}

	public async set(
		key: K,
		value: V,
		ttl: ICacheOptions['expireAfter'] = this.expireAfter,
		ref: ICacheOptions['refreshAfter'] = this.refreshAfter
	): Promise<void> {
		if (this.maxSize && this.storage.size >= this.maxSize) {
			this.metrics.evictions += 1;

			let olderTime;
			let olderKey;

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

			if (typeof olderKey === 'string') {
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

	protected abstract load(key: K): Promise<V>;

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

import moment, { Duration, Moment } from 'moment';
import { BaseClient } from '../../Client';

interface CacheMeta {
	cachedAt: Moment;
	validUntil: Moment;
}

export abstract class BaseCache<T> {
	protected client: BaseClient;

	protected maxCacheDuration: Duration = moment.duration(6, 'h');
	protected cache: Map<string, T> = new Map();
	protected cacheMeta: Map<string, CacheMeta> = new Map();

	private pending: Map<string, Promise<T>> = new Map();

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public abstract async init(): Promise<void>;

	public async get(key: string): Promise<T> {
		const cached = this.cache.get(key);
		if (typeof cached !== 'undefined') {
			const meta = this.cacheMeta.get(key);
			if (meta && meta.validUntil.isAfter(moment())) {
				return cached;
			}
		}

		const res = this.pending.get(key);

		if (res) {
			return await res;
		}

		const promise = this._get(key).finally(() => this.pending.delete(key));
		this.pending.set(key, promise);

		const obj = await promise;

		this.set(key, obj);

		return obj;
	}

	public getCacheMeta(key: string) {
		return this.cacheMeta.get(key);
	}

	protected abstract async _get(key: string): Promise<T>;

	public async set(key: string, value: T): Promise<T> {
		this.cache.set(key, value);
		this.cacheMeta.set(key, {
			cachedAt: moment(),
			validUntil: moment().add(this.maxCacheDuration)
		});

		return value;
	}

	protected isObject(item: Partial<T>) {
		return item && typeof item === 'object' && !Array.isArray(item);
	}

	public has(key: string) {
		const meta = this.cacheMeta.get(key);
		return meta && this.cache.has(key) && meta.validUntil.isAfter(moment());
	}

	public flush(key: string) {
		this.cache.delete(key);
		this.cacheMeta.delete(key);
	}

	public clear() {
		this.cache = new Map();
		this.cacheMeta = new Map();
	}

	public partition(fn: (value: T) => boolean): [Map<string, T>, Map<string, T>] {
		const results: [Map<string, T>, Map<string, T>] = [new Map(), new Map()];

		for (const [key, val] of this.cache) {
			if (fn(val)) {
				results[0].set(key, val);
			} else {
				results[1].set(key, val);
			}
		}

		return results;
	}

	get size() {
		return this.cache.size;
	}
}

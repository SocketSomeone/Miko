import moment, { Duration, Moment } from 'moment';
import { BaseClient } from '../../Client';

interface CacheMeta {
	cachedAt: Moment;
	validUntil: Moment;
}

export abstract class BaseCache<CachedObject> {
	protected client: BaseClient;

	protected maxCacheDuration: Duration = moment.duration(6, 'h');
	protected cache: Map<string, CachedObject> = new Map();
	protected cacheMeta: Map<string, CacheMeta> = new Map();

	private pending: Map<string, Promise<CachedObject>> = new Map();

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public abstract async init(): Promise<void>;

	public async get(key: string): Promise<CachedObject> {
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

		this.cache.set(key, obj);
		this.cacheMeta.set(key, {
			cachedAt: moment(),
			validUntil: moment().add(this.maxCacheDuration)
		});

		return obj;
	}

	public getCacheMeta(key: string) {
		return this.cacheMeta.get(key);
	}

	protected abstract async _get(key: string): Promise<CachedObject>;

	public async set(key: string, value: CachedObject): Promise<CachedObject> {
		this.cache.set(key, value);
		this.cacheMeta.set(key, {
			cachedAt: moment(),
			validUntil: moment().add(this.maxCacheDuration)
		});

		return value;
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

	public getSize() {
		return this.cache.size;
	}
}

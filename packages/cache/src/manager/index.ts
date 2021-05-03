import type { Constructor } from '@miko/utils';
import { singleton } from 'tsyringe';
import { BaseCache } from '../cache';
import type { ICacheOptions } from '../types';

@singleton()
export class CacheManager {
	private storage: Map<string, BaseCache<unknown, unknown>> = new Map();

	public async get<T, K>(clazz: Constructor<T>, key: K, supplier?: ICacheOptions<K, T>['load']): Promise<T> {
		const cache = this.getCache(clazz);

		let value = await cache.get(key);

		if (value === null && !!supplier) {
			value = await supplier(key);

			cache.set(key, value);
		}

		return value as T;
	}

	public delete<T, K>(clazz: Constructor<T> | string, key: K): void {
		const cache = this.getCache(clazz);

		if (cache !== null) {
			cache.delete(key);
		}
	}

	private getCache<T>(clazz: Constructor<T> | string) {
		const cacheName = typeof clazz === 'string' ? clazz : clazz.name;

		let cache = this.storage.get(cacheName);

		if (!cache) {
			cache = new BaseCache();
			this.storage.set(cacheName, cache);
		}

		return cache;
	}
}

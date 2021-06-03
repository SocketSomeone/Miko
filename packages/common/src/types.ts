import type { Duration } from 'moment';
import type { MetadataCache } from './models';

export type AllowArray<T> = T | T[];

export type Constructor<T extends Object = {}> = new (...args: unknown[]) => T;

export type ObjectOfItems<T> = { [key: string]: T };

export type Arguments<T> = [T] extends [(...args: infer U) => unknown] ? U : [T] extends [void] ? [] : [T];

export type Awaited<T> = PromiseLike<T> | T;
export interface ICacheOptions<K, V> {
	maxSize?: number;
	expireAfter?: Duration;
	refreshAfter?: Duration;
	cleanupInterval?: number;
	refreshInterval?: number;
	load?: (key: K) => Promise<V>;
}
export interface ICacheEntry<V> {
	data: V;
	meta: MetadataCache;
}

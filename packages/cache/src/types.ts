import type { Duration } from 'moment';
import type { MetadataCache } from './meta/metadata';

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

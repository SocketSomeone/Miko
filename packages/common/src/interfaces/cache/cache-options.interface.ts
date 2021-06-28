import type { Duration } from 'moment';

export interface ICacheOptions<K, V> {
	maxSize?: number;
	expireAfter?: Duration;
	refreshAfter?: Duration;
	cleanupInterval?: number;
	refreshInterval?: number;
	load?: (key: K) => Promise<V>;
}

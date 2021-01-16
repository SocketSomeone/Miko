import { Duration, Moment } from 'moment';

export interface ICacheOptions<K, V> {
	maxSize?: number;
	expireAfter?: Duration;
	refreshAfter?: Duration;
	checkInterval?: number;

	load?: (key: K) => Promise<V>;
}

export interface ICacheEntry<V> {
	data: V;
	addedAt: Moment;
	expires: Moment;
	refresh: Moment;
}

export interface ICacheEvents<K, V> {
	outdated: [K, V];
	update: [K, V];
	deleted: [K];
	cleared: [];
}
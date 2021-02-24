import { Duration } from 'moment';
import { MetadataCache } from './meta/metadata';

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

export interface ICacheEvents<K, V> {
	set: (key: K, value: V) => void;
	delete: (key: K, reason: string) => void;
	error: (key: K, err: Error) => void;
}

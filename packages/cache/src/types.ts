import { Duration, Moment } from 'moment';

export interface ICacheOptions<V> {
	maxSize?: number;
	expireAfter?: Duration;
	refreshAfter?: Duration;
	checkInterval?: number;
	load?: (key: string) => Promise<V>;
}

export interface ICacheEntry<V> {
	data: V;
	addedAt: Moment;
	expires: Moment | null;
	refresh: Moment | null;
}

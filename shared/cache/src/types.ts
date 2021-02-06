import { Duration, Moment } from 'moment';

export interface ICacheOptions {
    maxSize?: number;
    expireAfter?: Duration;
    refreshAfter?: Duration;
    checkInterval?: number;
}

export interface ICacheEntry<V> {
    data: V;
    addedAt: Moment;
    expires: Moment | null;
    refresh: Moment | null;
}

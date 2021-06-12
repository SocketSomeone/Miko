import type { MetadataCache } from './cache-metadata.interface';

export interface ICacheEntry<V> {
	data: V;
	meta: MetadataCache;
}

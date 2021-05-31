import moment, { duration } from 'moment';
import MockDate from 'mockdate';
import { LoadingCache } from '../src/cache';
import type { ICacheOptions } from '../src/types';

const defaultTestConfig: ICacheOptions<string, string> = {
	refreshInterval: null,
	cleanupInterval: null,
	expireAfter: duration(5, 'seconds'),
	maxSize: 2
};

let cache: LoadingCache<string, string> = new LoadingCache<string, string>(defaultTestConfig);

afterEach(() => cache.flush());

test('[Cache] Saving', async () => {
	expect(await cache.get('hello')).toBeNull();

	cache.set('hello', 'world');

	expect(cache.get('world')).resolves.toBeNull();
	expect(cache.get('hello')).resolves.toBe('world');
	expect(cache.size).toBe(1);
});

test('[Cache] Deleting', async () => {
	cache.set('hello', 'world');
	cache.delete('hello');

	expect(cache.get('hello')).resolves.toBeNull();
	expect(cache.size).toBe(0);

	cache.set('hello', 'world');
	cache.flush();

	expect(cache.size).toBe(0);
});

test('[Cache] Evict by size', async () => {
	cache.set('1', 'junk');
	cache.set('2', 'junk');
	cache.set('3', 'junk');

	expect(cache.get('hello')).resolves.toBeNull();
	expect(cache.size).toBe(3);
});

test('[Cache] Evict by time', async () => {
	cache.set('hello', 'world');

	expect(cache.get('hello')).resolves.toBe('world');

	MockDate.set(moment().add(10, 'seconds').toDate());

	expect(cache.get('hello')).resolves.toBeNull();
});

test('[Cache] Refreshing', async () => {
	cache = new LoadingCache<string, string>({
		...defaultTestConfig,
		load: async () => {
			return 'Loaded';
		}
	});

	cache.set('another', 'world');
	await cache.refresh('another');

	expect(cache.get('another')).resolves.toBe('Loaded');
	expect(cache.size).toBe(1);
});

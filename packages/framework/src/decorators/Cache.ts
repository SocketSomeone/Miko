/* eslint-disable @typescript-eslint/ban-types */
import { MiCache } from '@miko/cache';
import { metaStorage } from '../metadata';
import { Constructor } from '../types';

export function Cache<T extends MiCache>(explicitCache?: Constructor<T>): PropertyDecorator {
    return (target: Object, key: string | symbol): void => {
        const implicitCache = Reflect.getMetadata('design:type', target, key);

        if (!implicitCache && !explicitCache) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have defined type`);
        }

        const CacheClass = explicitCache || implicitCache;

        if (!metaStorage.caches.has(CacheClass)) {
            metaStorage.caches.set(CacheClass, new CacheClass());
        }

        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metaStorage.caches.get(CacheClass); }
        });
    };
}

/* eslint-disable @typescript-eslint/ban-types */
import { Constructor } from '../types';
import { MiService } from '../index';
import { metaStorage } from '../metadata';

export function Service<T extends MiService>(ExplicitService?: Constructor<T>): PropertyDecorator {
    return (target: Object, key: string | symbol): void => {
        const ImplicitService = Reflect.getMetadata('design:type', target, key);

        if (!ImplicitService && !ExplicitService) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have an explicitly defined type`);
        }

        const ServiceClass = ExplicitService || ImplicitService;

        if (!metaStorage.services.has(ServiceClass)) {
            metaStorage.services.set(ServiceClass, new ServiceClass());
        }

        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metaStorage.caches.get(ServiceClass); }
        });
    };
}

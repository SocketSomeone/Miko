/* eslint-disable @typescript-eslint/ban-types */

import { AutowiredLifetimes, IAutowiredOptions } from '../models';
import { Constructor } from '../types';
import { getDIKey } from './helpers';
import storage from '../storage';

export function resolveService<T = unknown>(
    inConstructor: Constructor<T>,
    inOptions?: IAutowiredOptions,
    caller?: object,
    propertyKey?: string | symbol
): T {
    const constructor = inConstructor;
    const options = inOptions;

    const lifeTime = (options && options.lifeTime) || AutowiredLifetimes.Singleton;

    if (lifeTime === AutowiredLifetimes.Singleton) {
        if (storage.has(constructor)) {
            return storage.get(constructor) as T;
        }
    } else if (lifeTime === AutowiredLifetimes.PerOwned && propertyKey) {
        if (Reflect.has(constructor, getDIKey(propertyKey))) {
            return Reflect.get(constructor, getDIKey(propertyKey)) as T;
        }
    } else if (lifeTime === AutowiredLifetimes.PerInstance && caller && propertyKey) {
        if (Reflect.has(caller, getDIKey(propertyKey))) {
            return Reflect.get(caller, getDIKey(propertyKey)) as T;
        }
    }

    const params: Constructor<object>[] = Reflect.getMetadata('design:paramtypes', constructor) as [] || [];

    const object = new constructor(...params
        .map((paramConstructor: Constructor<object>) => resolveService(paramConstructor, options)));

    if (lifeTime === AutowiredLifetimes.Singleton) {
        storage.set(constructor, object);
    } else if (lifeTime === AutowiredLifetimes.PerOwned) {
        Reflect.set(constructor, getDIKey(propertyKey), object);
    } else if (lifeTime === AutowiredLifetimes.PerInstance && caller) {
        Reflect.set(caller, getDIKey(propertyKey), object);
    }

    return object;
}
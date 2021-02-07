/* eslint-disable @typescript-eslint/ban-types */
import { MiClient } from '..';
import { metaStorage } from '../metadata';

export function Client(): PropertyDecorator {
    return (target: Object, key: string | symbol): void => {
        const implicitCache = Reflect.getMetadata('design:type', target, key);

        if (implicitCache !== MiClient) {
            throw new Error(`${target.constructor.name}:${key.toString()} needs to have defined type`);
        }

        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: true,
            get() { return metaStorage.client; }
        });
    };
}

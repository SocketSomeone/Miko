/* eslint-disable @typescript-eslint/ban-types */

import { IAutowiredOptions } from '../models/autoware-options';
import { Constructor } from '../types';
import { resolveService } from '../utils/resolver';

export function Autowired(options?: IAutowiredOptions): PropertyDecorator {
    return (target: object, propertyKey: string | symbol): void => {
        const type: Constructor<object> = Reflect.getMetadata('design:type', target, propertyKey);

        Reflect.defineProperty(
            target,
            propertyKey,
            {
                configurable: false,
                enumerable: false,
                get() {
                    return resolveService(type, options, this, propertyKey);
                }
            }
        );
    };
}
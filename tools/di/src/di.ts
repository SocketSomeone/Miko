/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { AutowiredLifetimes } from './models/autoware-lifetimes';
import { IAutowiredOptions } from './models/autoware-options';
import { Constructor } from './types';

const getDIKey: (propertyKey?: string | symbol) => string = (propertyKey?: string | symbol) => `$_di_${String(propertyKey)}`;

export class DI {
    public autowired!: (options?: IAutowiredOptions) => PropertyDecorator;

    public reset!: () => void;

    public resolve!: <T extends object>(
        constructor: Constructor<T>,
        options?: IAutowiredOptions,
        caller?: object,
        propertyKey?: string | symbol
    ) => T;

    protected singletonsList: Map<Constructor<object>, object> = new Map<Constructor<object>, object>();

    constructor() {
        this.autowired = (options?: IAutowiredOptions) => this.makeAutowired(options);
        this.reset = () => this.makeReset;

        this.resolve = <T extends object>(
            constructor: Constructor<T>,
            options?: IAutowiredOptions,
            caller?: object,
            propertyKey?: string | symbol
        ) => this.makeResolve(constructor, options, caller, propertyKey);
    }

    protected makeAutowired(options?: IAutowiredOptions): PropertyDecorator {
        return (target: object, propertyKey: string | symbol): void => {
            const type: Constructor<object> = (Reflect as any).getMetadata('design:type', target, propertyKey);
            const { resolve } = this;

            Reflect.defineProperty(
                target,
                propertyKey,
                {
                    configurable: false,
                    enumerable: false,
                    get() {
                        return resolve(type, options, this, propertyKey);
                    }
                }
            );
        };
    }

    protected makeResolve<T extends object>(
        inConstructor: Constructor<T>,
        inOptions?: IAutowiredOptions,
        caller?: object,
        propertyKey?: string | symbol
    ): T {
        const constructor = inConstructor;
        const options = inOptions;

        const lifeTime = (options && options.lifeTime) || AutowiredLifetimes.Singleton;

        if (lifeTime === AutowiredLifetimes.Singleton) {
            if (this.singletonsList.has(constructor)) {
                return this.singletonsList.get(constructor) as T;
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

        const params: Constructor<object>[] = (Reflect as any).getMetadata('design:paramtypes', constructor) as [] || [];

        const object = new constructor(...params
            .map((paramConstructor: Constructor<object>) => this.makeResolve(paramConstructor, options)));

        if (lifeTime === AutowiredLifetimes.Singleton) {
            this.singletonsList.set(constructor, object);
        } else if (lifeTime === AutowiredLifetimes.PerOwned) {
            Reflect.set(constructor, getDIKey(propertyKey), object);
        } else if (lifeTime === AutowiredLifetimes.PerInstance && caller) {
            Reflect.set(caller, getDIKey(propertyKey), object);
        }

        return object;
    }

    protected makeReset(): void {
        this.singletonsList = new Map<Constructor<object>, object>();
    }
}
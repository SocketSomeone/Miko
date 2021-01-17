import 'reflect-metadata';

export const cacheInjections: Map<unknown, Map<string, unknown>> = new Map();

export function Cache(explicitType?: () => unknown) {
    return <T extends PropertyDecorator>(target: T, key: string): void => {
        let classMap = cacheInjections.get(target.constructor);

        if (!classMap) {
            classMap = new Map();
            cacheInjections.set(target.constructor, classMap);
        }

        const implicitType = Reflect.getMetadata('design:type', target, key);

        if (!implicitType && !explicitType) {
            throw new Error(`${target.constructor.name}:${key} needs to have an explicitly defined type`);
        }

        const type = explicitType || (() => implicitType);

        classMap.set(key, type);
    };
}

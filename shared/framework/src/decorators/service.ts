import 'reflect-metadata';

export const serviceInjections: Map<unknown, Map<string, () => unknown>> = new Map();

export function Service(explicitType?: () => unknown) {
    return <T extends PropertyDecorator>(target: T, key: string): void => {
        let classMap = serviceInjections.get(target.constructor);

        if (!classMap) {
            classMap = new Map();
            serviceInjections.set(target.constructor, classMap);
        }

        const implicitType = Reflect.getMetadata('design:type', target, key);

        if (!implicitType && !explicitType) {
            throw new Error(`${target.constructor.name}:${key} needs to have an explicitly defined type`);
        }

        const type = explicitType || (() => implicitType);
        classMap.set(key, type);
    };
}

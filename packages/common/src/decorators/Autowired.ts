import { container } from 'tsyringe';

export function AutoWired(): PropertyDecorator {
	return (target: unknown, propertyKey: string | symbol): void => {
		if (target && propertyKey) {
			const type = Reflect.getMetadata('design:type', target, propertyKey);

			if (type === undefined) {
				throw new Error(`failed to get design type of ${target.constructor.name}:${String(propertyKey)}`);
			}

			const clazz = container.resolve(type);

			Object.defineProperty(target, propertyKey, {
				get: () => clazz
			});
		}
	};
}

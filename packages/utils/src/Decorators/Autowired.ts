import 'reflect-metadata';
import { container } from 'tsyringe';

export function AutoWired(): PropertyDecorator {
	return (target: unknown, propertyKey: string | symbol): void => {
		if (target && propertyKey) {
			const type = Reflect.getMetadata('design:type', target, propertyKey);

			if (type === undefined) {
				throw new Error(`failed to get design type of ${target.constructor.name}:${String(propertyKey)}`);
			}

			Object.defineProperty(target, propertyKey, {
				get: () => {
					return container.resolve(type);
				}
			});
		}
	};
}

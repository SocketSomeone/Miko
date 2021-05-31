import { getCustomRepository } from 'typeorm';

export function Repository(): PropertyDecorator {
	return (target: unknown, propertyKey: string | symbol): void => {
		if (target && propertyKey) {
			const type = Reflect.getMetadata('design:type', target, propertyKey);

			if (type === undefined) {
				throw new Error(`failed to get design type of ${target.constructor.name}:${String(propertyKey)}`);
			}

			Object.defineProperty(target, propertyKey, {
				get: () => {
					return getCustomRepository(type, process.env.NODE_ENV);
				}
			});
		}
	};
}

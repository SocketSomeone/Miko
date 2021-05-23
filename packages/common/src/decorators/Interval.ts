export function Interval(timeout: number): MethodDecorator {
	return (target: Object, propertyKey: string | symbol): void => {
		if (typeof target[propertyKey] !== 'function') {
			throw new Error('Interval decorator can only be applied to methods');
		}

		const list = Reflect.getOwnMetadata('SCHEDULER_INTERVALS', target) || [];

		list.push({
			propertyKey,
			timeout
		});

		Reflect.defineMetadata('SCHEDULER_INTERVALS', list, target);
	};
}

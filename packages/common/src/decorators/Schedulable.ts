export function Schedulable(): ClassDecorator {
	return target => {
		return class extends target.prototype.constructor {
			constructor(...args: unknown[]) {
				super(...args);

				const intervals = Reflect.getOwnMetadata('SCHEDULER_INTERVALS', target.prototype);

				for (const { propertyKey, timeout } of intervals) setInterval(this[propertyKey].bind(this), timeout);
			}
		} as never;
	};
}

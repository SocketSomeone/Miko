/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { container } from 'tsyringe';

export const PostConstruct = (target: any, propertyKey: string | symbol): void =>
	container.afterResolution(target.constructor, (_, result) => result[propertyKey](), { frequency: 'Once' });

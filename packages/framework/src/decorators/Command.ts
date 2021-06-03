import type { Constructor } from '@miko/common';
import type { ICommandOptions } from '../types';

export function Command(opts: ICommandOptions) {
	return (ctor: Constructor): unknown => {
		return class extends ctor {
			constructor(previousOpts: ICommandOptions) {
				super(Object.assign(previousOpts, opts));
			}
		};
	};
}

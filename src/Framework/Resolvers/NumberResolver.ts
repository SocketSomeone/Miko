import { BaseClient } from '../../client';
import { Context } from '../Services/Commands/Command';

import { Resolver } from './Resolver';

const MAX_VALUE = Number.MAX_SAFE_INTEGER;
const MIN_VALUE = Number.MIN_SAFE_INTEGER;

export class NumberResolver extends Resolver {
	private min?: number;
	private max?: number;

	public constructor(client: BaseClient, min?: number, max?: number) {
		super(client);

		this.min = min;
		this.max = max;
	}

	public async resolve(value: string, { funcs: { t } }: Context): Promise<number> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		const val = parseFloat(value);
		if (isNaN(val) || !isFinite(val)) {
			throw Error(t(`resolvers.number.invalid`));
		}

		if (val < MIN_VALUE) {
			throw Error(t(`resolvers.number.tooSmall`, { min: this.min || MIN_VALUE }));
		}
		if (val > MAX_VALUE) {
			throw Error(t(`resolvers.number.tooLarge`, { max: this.max || MAX_VALUE }));
		}

		if (this.min) {
			if (val < this.min) {
				throw Error(t(`resolvers.number.tooSmall`, { min: this.min }));
			}
		}
		if (this.max) {
			if (val > this.max) {
				throw Error(t(`resolvers.number.tooLarge`, { max: this.max }));
			}
		}

		return val;
	}
}

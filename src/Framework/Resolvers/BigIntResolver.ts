import { BaseClient } from '../../client';
import { Context } from '../Commands/Command';
import { BaseModule } from '../Module';

import { Resolver } from './Resolver';

const MAX_VALUE = BigInt(Number.MAX_SAFE_INTEGER);
const MIN_VALUE = BigInt(Number.MIN_SAFE_INTEGER);

export class BigIntResolver extends Resolver {
	private min?: bigint;
	private max?: bigint;

	public constructor(module: BaseModule, min?: bigint, max?: bigint) {
		super(module);

		this.min = min;
		this.max = max;
	}

	public async resolve(value: string, { funcs: { t } }: Context): Promise<bigint> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		let val: bigint;

		try {
			val = BigInt(value);
		} catch (err) {
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

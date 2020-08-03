import { BaseClient } from '../../client';
import { Context } from '../commands/Command';

import { Resolver } from './Resolver';

const MAX_VALUE = 9007199254740991n;
const MIN_VALUE = -9007199254740991n;

export class BigIntResolver extends Resolver {
	private min?: bigint;
	private max?: bigint;

	public constructor(client: BaseClient, min?: bigint, max?: bigint) {
		super(client);

		this.min = min;
		this.max = max;
	}

	public async resolve(value: string, { funcs: { t } }: Context): Promise<bigint> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		const val = BigInt(value);
		if (!val) {
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

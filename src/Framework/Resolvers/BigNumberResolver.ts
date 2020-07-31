import { BaseClient } from '../../client';
import { Context } from '../commands/Command';

import { Resolver } from './Resolver';
import BigNumber from 'bignumber.js';

export class BigNumberResolver extends Resolver {
	private min?: number;
	private max?: number;
	private canInfinity: boolean = false;

	public constructor(client: BaseClient, min?: number, max?: number, canInfinity: boolean = false) {
		super(client);

		this.min = min;
		this.max = max;
		this.canInfinity = canInfinity;
	}

	public async resolve(value: string, { funcs: { t } }: Context): Promise<BigNumber> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		const val = new BigNumber(value);

		if (val.isNaN() || (!val.isFinite() && !this.canInfinity) || (!val.isInteger() && !this.canInfinity)) {
			throw Error(t(`resolvers.number.invalid`));
		}

		if (this.min) {
			if (val.lt(this.min)) {
				throw Error(t(`resolvers.number.tooSmall`, { min: this.min }));
			}
		}
		if (this.max) {
			if (val.gt(this.max)) {
				throw Error(t(`resolvers.number.tooLarge`, { max: this.max }));
			}
		}

		return val;
	}
}

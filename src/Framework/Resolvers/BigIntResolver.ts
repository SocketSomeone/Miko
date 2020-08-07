import { BaseClient } from '../../client';
import { Context } from '../commands/Command';

import { Resolver } from './Resolver';

export class BigIntResolver extends Resolver {
	private min?: bigint;
	private max?: bigint;
	private canInfinity: boolean = false;

	public constructor(client: BaseClient, min?: bigint, max?: bigint, canInfinity: boolean = false) {
		super(client);

		this.min = min;
		this.max = max;
		this.canInfinity = canInfinity;
	}

	public async resolve(value: string, { funcs: { t } }: Context): Promise<bigint> {
		if (typeof value === typeof undefined || value.length === 0) {
			return;
		}

		const val = BigInt(value) || null;

		if (!val) {
			throw Error(t(`resolvers.number.invalid`));
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

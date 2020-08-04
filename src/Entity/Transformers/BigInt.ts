import { ValueTransformer } from 'typeorm';

import moment, { Moment } from 'moment';

export const BigIntTransformer: ValueTransformer = {
	from: (d: string) => BigInt(d) || null,
	to: (date: BigInt) => {
		if (!date) {
			return null;
		}

		return date.toString();
	}
};

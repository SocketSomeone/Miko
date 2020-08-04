import { ValueTransformer } from 'typeorm';

import moment from 'moment';
import BigNumber from 'bignumber.js';

export const BigNumberTransformer: ValueTransformer = {
	from: (n) => new BigNumber(n),
	to: (n: BigNumber) => {
		if (!n) return '0';

		return n.toString().length >= 25 ? 'Infinity' : n.toString();
	}
};

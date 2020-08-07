import { ValueTransformer } from 'typeorm';

import { duration, Duration } from 'moment';

export const BigIntTransformer: ValueTransformer = {
	from: (databaseValue: string): bigint => BigInt(databaseValue),
	to: (entityValue: bigint) => String(entityValue)
};

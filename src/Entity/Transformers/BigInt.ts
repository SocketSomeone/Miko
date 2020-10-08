import { ValueTransformer } from 'typeorm';

export const BigIntTransformer: ValueTransformer = {
	from: (databaseValue: string): bigint => BigInt(databaseValue),
	to: (entityValue: bigint) => String(entityValue > 9223372036854775807n ? 9223372036854775807n : entityValue)
};

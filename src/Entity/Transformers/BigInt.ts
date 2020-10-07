import { ValueTransformer } from 'typeorm';

export const BigIntTransformer: ValueTransformer = {
	from: (databaseValue: string): bigint => (databaseValue ? BigInt(databaseValue) : null),
	to: (entityValue: bigint) =>
		entityValue ? String(entityValue > 9223372036854775807n ? 9223372036854775807n : entityValue) : null
};

import { ValueTransformer } from 'typeorm';

export const SetTransformer: ValueTransformer = {
	from: (arr: string[]) => new Set(arr),
	to: (arr: Set<string>) => [...arr]
};

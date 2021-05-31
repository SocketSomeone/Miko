import { BaseArgument } from '../models';

export class StringArgument extends BaseArgument<string> {
	public async resolve(value: string): Promise<string> {
		return value;
	}
}

import { Resolver } from './resolver';

export class StringResolver extends Resolver<string> {
	public async resolve(value: string): Promise<string> {
		return value;
	}
}

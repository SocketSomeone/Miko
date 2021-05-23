import { BaseResolver } from '../models';

export class StringResolver extends BaseResolver<string> {
	public async resolve(value: string): Promise<string> {
		return value;
	}
}

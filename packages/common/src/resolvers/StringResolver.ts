import { MiResolver } from './resolver';

export class StringResolver extends MiResolver<string> {
	public async resolve(value: string): Promise<string> {
		return value;
	}
}

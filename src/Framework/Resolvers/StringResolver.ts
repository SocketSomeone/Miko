import { Context } from '../commands/Command';

import { Resolver } from './Resolver';
import { BaseClient } from '../../Client';

export class StringResolver extends Resolver {
	private regex: RegExp;

	public constructor(client: BaseClient, regex?: RegExp) {
		super(client);

		this.regex = regex;
	}

	public async resolve(value: string, { guild }: Context): Promise<string> {
		if (this.regex && !this.regex.test(value)) return;

		return value;
	}
}

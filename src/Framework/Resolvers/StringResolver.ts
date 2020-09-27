import { Context } from '../Commands/Command';

import { Resolver } from './Resolver';
import { BaseClient } from '../../Client';
import { BaseModule } from '../Module';

export class StringResolver extends Resolver {
	private regex: RegExp;

	public constructor(module: BaseModule, regex?: RegExp) {
		super(module);

		this.regex = regex;
	}

	public async resolve(value: string, { guild }: Context): Promise<string> {
		if (this.regex && !this.regex.test(value)) return;

		return value;
	}
}

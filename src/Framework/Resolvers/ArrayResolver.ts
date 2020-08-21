import { BaseClient } from '../../client';
import { Context } from '../commands/Command';

import { Resolver, ResolverConstructor } from './Resolver';

export class ArrayResolver extends Resolver {
	private resolver: Resolver;
	private def: any[];

	public constructor(client: BaseClient, resolver: Resolver | ResolverConstructor, def?: any[]) {
		super(client);

		if (resolver instanceof Resolver) {
			this.resolver = resolver;
		} else {
			this.resolver = new resolver(client);
		}

		this.def = def;
	}

	public async resolve(value: string, context: Context, previous: any[]): Promise<any[]> {
		if (!value) {
			return this.def;
		}

		const rawSplits = value.split(/[,\s]/);

		const splits: string[] = [];
		let quote = false;
		let acc = '';
		for (let j = 0; j < rawSplits.length; j++) {
			const split = rawSplits[j];
			if (!split.length) {
				continue;
			}

			if (split.startsWith(`"`)) {
				quote = true;
				acc = '';
			}

			if (split.endsWith(`"`)) {
				quote = false;
				acc += ' ' + split.substring(0, split.length - 1);
				splits.push(acc.substring(2));
				continue;
			}

			if (quote) {
				acc += ' ' + split;
			} else {
				splits.push(split);
			}
		}

		return await Promise.all(splits.map((s) => this.resolver.resolve(s, context, previous)));
	}
}

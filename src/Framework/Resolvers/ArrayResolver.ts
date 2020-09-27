import { Context } from '../Commands/Command';
import { BaseModule } from '../Module';

import { Resolver, ResolverConstructor } from './Resolver';

export class ArrayResolver extends Resolver {
	private resolver: Resolver;
	private def: any[];

	public constructor(module: BaseModule, resolver: Resolver | ResolverConstructor, def?: any[]) {
		super(module);

		if (resolver instanceof Resolver) {
			this.resolver = resolver;
		} else {
			this.resolver = new resolver(module);
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

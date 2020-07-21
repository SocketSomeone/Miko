'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ArrayResolver = void 0;
const Resolver_1 = require('./Resolver');
class ArrayResolver extends Resolver_1.Resolver {
	constructor(client, resolver) {
		super(client);
		if (resolver instanceof Resolver_1.Resolver) {
			this.resolver = resolver;
		} else {
			this.resolver = new resolver(client);
		}
	}
	async resolve(value, context, previous) {
		if (!value) {
			return;
		}
		const rawSplits = value.split(/[,\s]/);
		const splits = [];
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
exports.ArrayResolver = ArrayResolver;
//# sourceMappingURL=ArrayResolver.js.map

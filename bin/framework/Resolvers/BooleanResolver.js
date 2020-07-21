'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.BooleanResolver = void 0;
const Resolver_1 = require('./Resolver');
const ts = new Set(['true', 'on', 'y', 'yes', 'enable', 'вкл', 'включить']);
const fs = new Set(['false', 'off', 'n', 'no', 'disable', 'выкл', 'выключить']);
class BooleanResolver extends Resolver_1.Resolver {
	async resolve(value, { t }) {
		if (typeof value === typeof undefined) {
			return;
		}
		value = value.toLowerCase();
		if (ts.has(value)) {
			return true;
		}
		if (fs.has(value)) {
			return false;
		}
		throw Error(t(`resolvers.boolean.invalid`));
	}
}
exports.BooleanResolver = BooleanResolver;
//# sourceMappingURL=BooleanResolver.js.map

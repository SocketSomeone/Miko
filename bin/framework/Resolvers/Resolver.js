'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.Resolver = void 0;
class Resolver {
	constructor(client) {
		this.client = client;
	}
	getType() {
		return this.constructor.name.replace(/Resolver/g, '').toLowerCase();
	}
}
exports.Resolver = Resolver;
//# sourceMappingURL=Resolver.js.map

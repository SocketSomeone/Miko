'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class BaseService {
	constructor(client) {
		this.client = null;
		this.client = client;
	}
	async init() {
		// NO-OP
	}
	async onClientReady() {
		this.startupDone();
	}
	startupDone() {
		this.client.serviceStartupDone(this);
	}
}
exports.BaseService = BaseService;
//# sourceMappingURL=Service.js.map

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Cache_1 = require('./Cache');
const Guild_1 = require('../../Entity/Guild');
class PermissionsCache extends Cache_1.BaseCache {
	async init() {
		// NO-OP
	}
	async _get(guildId) {
		const { permissions } = await Guild_1.Guild.findOne(guildId);
		return permissions;
	}
}
exports.PermissionsCache = PermissionsCache;
//# sourceMappingURL=PermissionsCache.js.map

'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Cache_1 = require('./Cache');
const GuildSetting_1 = require('../../Misc/Models/GuildSetting');
const Guild_1 = require('../../Entity/Guild');
class GuildSettingsCache extends Cache_1.BaseCache {
	async init() {
		// NO-OP
	}
	async _get(guildId) {
		const { sets } = await Guild_1.Guild.findOne(guildId);
		return Object.assign(Object.assign({}, GuildSetting_1.Defaults), sets);
	}
}
exports.GuildSettingsCache = GuildSettingsCache;
//# sourceMappingURL=GuildSettingsCache.js.map

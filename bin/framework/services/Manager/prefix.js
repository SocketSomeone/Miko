'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const Service_1 = require('../Service');
class PrefixManger extends Service_1.BaseService {
	hasPrefix(content, prefix) {
		if (prefix && content.startsWith(prefix)) {
			return content.substring(prefix.length).trim();
		}
		const regex = /^(?:<@!?)?(\d+)>? ?(.*)$/;
		if (regex.test(content)) {
			const matches = content.match(content);
			if (matches[1] !== this.client.user.id) {
				return null;
			}
			return matches[2].trim();
		}
		return null;
	}
}
exports.PrefixManger = PrefixManger;
//# sourceMappingURL=prefix.js.map

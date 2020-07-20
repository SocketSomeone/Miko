import { BaseService } from '../Service';
import { BaseClient } from '../../../Client';

export class PrefixManger extends BaseService {
	hasPrefix(content: string, prefix?: string) {
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

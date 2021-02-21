import moment from 'moment';
import { User } from 'discord.js';
import { singleton } from 'tsyringe';

interface IThottlerCache {
	timestamp: number;
	count: number;
	seen: boolean;
}

const LIMIT = 1;
const COOLDOWN = 5;

@singleton()
export class Throttler {
	private cache: Map<string, IThottlerCache> = new Map();

	public async isThrottling({ id: cacheKey }: User): Promise<boolean> {
		const now = moment().valueOf();
		const before = this.cache.get(cacheKey);

		if (!before) {
			this.cache.set(cacheKey, this.defaultOptions());
			return false;
		}

		if (now - before.timestamp < (1 / LIMIT) * 1000) {
			if (!before.seen) {
				before.seen = true;
				before.timestamp = now + COOLDOWN;
			}

			return true;
		}

		return false;
	}

	private defaultOptions(): IThottlerCache {
		return {
			timestamp: moment().valueOf(),
			count: 0,
			seen: false
		};
	}
}

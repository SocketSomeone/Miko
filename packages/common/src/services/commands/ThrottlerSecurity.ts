import moment from 'moment';
import type { Message } from 'discord.js';
import { singleton } from 'tsyringe';
import type { Command } from '../../framework';

@singleton()
export class ThrottlerSecurity {
	private cache: Map<string, number> = new Map();

	public isThrottling({ author: { id: cacheKey } }: Message, { ratelimit, cooldown }: Command): boolean {
		const now = moment().valueOf();
		const before = this.cache.get(cacheKey);

		if (!before) {
			this.cache.set(cacheKey, moment().valueOf());
			return false;
		}

		if (now - before < ratelimit * 1000) {
			this.cache.set(cacheKey, now + cooldown);

			return true;
		}

		return false;
	}
}

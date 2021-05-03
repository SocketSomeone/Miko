import RabbitManager from 'rabbitmq-event-manager';

import { singleton } from 'tsyringe';
import { CacheManager } from '@miko/cache';
import type { ICacheDeleteRequest } from '../../models';
import { RabbitQueues } from '../../models';
import { Client } from '../../framework';

@singleton()
export class GatewayListner extends RabbitManager {
	public constructor(private readonly client: Client, private readonly cacheManager: CacheManager) {
		super({
			url: process.env.RABBIT_URL,
			application: `MIKO.RECEIVER.${client.shard.ids[0]}-${client.shard.ids[client.shard.ids.length - 1]}`
		});

		this.on(RabbitQueues.CACHE_DELETE, this.deleteCache.bind(this));
	}

	public async deleteCache(payload: ICacheDeleteRequest): Promise<void> {
		this.cacheManager.delete(payload.cacheName, payload.guildId);
	}
}

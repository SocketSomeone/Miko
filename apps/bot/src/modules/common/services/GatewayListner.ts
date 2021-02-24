import RabbitManager from 'rabbitmq-event-manager';

import { singleton } from 'tsyringe';
import { MiClient } from '@miko/common';
import { ICacheDeleteRequest, RabbitQueues } from '@miko/core';
import { CacheManager } from '@miko/cache';

@singleton()
export class GatewayListner extends RabbitManager {
	public constructor(private readonly client: MiClient, private readonly cacheManager: CacheManager) {
		// TODO: Ohh... fuck, refactor this
		super({
			url: process.env.RABBIT_URL,
			application: `MIKO.${client.shard.ids[0]}-${client.shard.ids[client.shard.ids.length - 1]}`
		});

		this.on(RabbitQueues.CACHE_DELETE, this.deleteCache.bind(this));
	}

	public async deleteCache(payload: ICacheDeleteRequest): Promise<void> {
		this.cacheManager.delete(payload.cacheName, payload.guildId);
	}
}

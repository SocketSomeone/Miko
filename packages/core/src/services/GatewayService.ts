import RabbitManager from 'rabbitmq-event-manager';

import { GuildEntity } from '@miko/database';
import { Constructor } from '@miko/utils';
import { singleton } from 'tsyringe';
import { RabbitQueues, ICacheDeleteRequest } from '../models';

@singleton()
export class GatewayService extends RabbitManager {
	public constructor() {
		super({
			application: 'API',
			url: process.env.RABBIT_URL
		});
	}

	public deleteCache<T extends GuildEntity>(clazz: Constructor<T>, guildId: string): void {
		this.emit(RabbitQueues.CACHE_DELETE, <ICacheDeleteRequest>{
			cacheName: clazz.name,
			guildId
		});
	}
}

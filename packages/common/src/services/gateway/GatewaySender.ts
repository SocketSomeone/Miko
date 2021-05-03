import RabbitManager from 'rabbitmq-event-manager';
import { singleton } from 'tsyringe';
import type { ICacheDeleteRequest } from '../../models';
import { RabbitQueues } from '../../models';

@singleton()
export class GatewaySender extends RabbitManager {
	public constructor() {
		super({
			application: `MIKO.SENDER.${process.pid}`,
			url: process.env.RABBIT_URL
		});
	}

	public deleteCache(options: ICacheDeleteRequest): void {
		this.emit(RabbitQueues.CACHE_DELETE, options);
	}
}

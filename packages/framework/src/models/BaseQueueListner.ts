import { AutoWired, GatewayService } from '@miko/common';
import type { IRabbitEvents } from '@miko/common';

import type { Awaited } from '@miko/types';
import { Client } from '../client';

export abstract class BaseQueueListner<Q extends keyof IRabbitEvents> {
	@AutoWired()
	public client: Client;

	@AutoWired()
	public gatewayService: GatewayService;

	public constructor(event: Q) {
		this.gatewayService.on(event, this.execute.bind(this));
	}

	public abstract execute(payload: IRabbitEvents[Q]): Awaited<unknown | void>;
}

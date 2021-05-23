/* eslint-disable @typescript-eslint/no-unused-vars */
import RabbitManager from 'rabbitmq-event-manager';
import { singleton } from 'tsyringe';
import type { IEventPayload, IListenerOption } from 'rabbitmq-event-manager/build/lib/interfaces';
import type { Awaited } from '@miko/types';
import type { IRabbitEvents } from '../models';

@singleton()
export class GatewayService extends RabbitManager {
	public constructor() {
		super({
			application: `MIKO.GATEWAY.${process.pid}`,
			url: process.env.RABBIT_URL
		});
	}

	public request<Q extends keyof IRabbitEvents = keyof IRabbitEvents>(key: Q, payload: IRabbitEvents[Q]): void {
		this.emit(key, payload);
	}

	public async get<T = unknown, Q extends keyof IRabbitEvents = keyof IRabbitEvents>(
		key: Q,
		payload: IRabbitEvents[Q] = null
	): Promise<T> {
		const { _metas, ...response } = await this.emitAndWait(key, payload || {});

		return <T>response;
	}

	public async on<Q extends keyof IRabbitEvents = keyof IRabbitEvents>(
		key: Q,
		listener: (payload?: IRabbitEvents[Q]) => Awaited<IEventPayload | void | null>,
		options?: IListenerOption
	): Promise<void> {
		return super.on(key, <never>listener, options);
	}
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { injectable, singleton } from 'tsyringe';
import type { Connection, Channel, Message as MQMessage } from 'amqplib';
import { connect } from 'amqplib';
import { v4 } from 'uuid';
import type { Awaited } from '@miko/types';
import type { GatewayCallback, IRabbitEvents } from '../models';
import { PostConstruct } from '../decorators';

const RETRY_INTERVAL = 10000;

@singleton()
export class GatewayService {
	private connection!: Connection;

	private channel!: Channel;

	private queue = process.env.IS_API ? `MIKO.GATEWAY.MANAGER` : `MIKO.GATEWAY.CLUSTER.${process.pid}`;

	private callbacks: Map<keyof IRabbitEvents, GatewayCallback[]> = new Map();

	private promises: Map<string, (value: any) => void> = new Map();

	@PostConstruct
	public async init(): Promise<void> {
		try {
			this.connection = await connect(process.env.RABBIT_URL);
			this.channel = await this.connection.createChannel();

			this.connection.on('close', this.reconnect.bind(this));
			this.channel.on('error', this.reconnect.bind(this));

			await this.assertQueues();
		} catch (err) {
			await this.reconnect();
		}
	}

	private async reconnect() {
		await this.destroy();

		setTimeout(this.init, RETRY_INTERVAL);
	}

	private async destroy() {
		if (this.channel) {
			await this.channel.close().catch(() => undefined);

			this.channel = null;
		}

		if (this.connection) {
			await this.connection.close().catch(() => undefined);

			this.connection = null;
		}
	}

	private async assertQueues() {
		await this.channel.assertQueue(this.queue, { durable: false, autoDelete: true });
		await this.channel.assertExchange('MIKO.GATEWAY.RESPONSES', 'fanout', { durable: false, autoDelete: true });
		await this.channel.bindQueue(this.queue, 'MIKO.GATEWAY.RESPONSES', '');

		if (!process.env.IS_API) {
			await this.channel.assertExchange('MIKO.GATEWAY.CLUSTERS', 'fanout', { durable: true });
			await this.channel.bindQueue(this.queue, 'MIKO.GATEWAY.CLUSTERS', '');
		}

		await this.channel.prefetch(5);
		await this.channel.consume(this.queue, this.onMessage.bind(this), { noAck: false });
	}

	private async onMessage(rawMessage: MQMessage) {
		if (!rawMessage) {
			return this.assertQueues();
		}

		try {
			const message = JSON.parse(rawMessage.content.toString());

			if (this.promises.has(message.correlationId)) {
				const promise = this.promises.get(message.correlationId);

				this.promises.delete(message.correlationId);

				promise(message.data);
			} else if (!message.isResponse && this.callbacks.has(message.event)) {
				const callbacks = this.callbacks.get(message.event);

				callbacks.forEach(async func => {
					const result = await func(message.data);

					if (result !== false && typeof result !== 'undefined')
						this.emit(message.event, result, message.correlationId);
				});
			}

			this.channel.ack(rawMessage, false);
		} catch (err) {
			this.channel.nack(rawMessage, false, false);
		}
	}

	public emit(event: string, payload?: Object, responseId?: string): Awaited<unknown>;

	public emit<T = any, Q extends keyof IRabbitEvents = keyof IRabbitEvents>(
		event: Q,
		payload?: IRabbitEvents[Q],
		responseId?: string
	): Promise<T>;

	public emit(event: string, payload: Object = null, responseId: string = null): Awaited<unknown> {
		return new Promise((res, rej) => {
			const correlationId = responseId || v4();
			const content = Buffer.from(
				JSON.stringify({
					correlationId,
					isResponse: !!responseId,
					event,
					data: payload
				})
			);

			if (responseId) {
				this.channel.publish('MIKO.GATEWAY.RESPONSES', '', content);
			} else if (process.env.IS_API) {
				this.channel.publish('MIKO.GATEWAY.CLUSTERS', '', content);
			} else {
				this.channel.sendToQueue('MIKO.GATEWAY.MANAGER', content);
			}

			this.promises.set(correlationId, res);
		});
	}

	public on<Q extends keyof IRabbitEvents = keyof IRabbitEvents>(key: Q, listener: GatewayCallback): void {
		const list = this.callbacks.get(key) || [];

		this.callbacks.set(key, list.concat(listener));
	}
}

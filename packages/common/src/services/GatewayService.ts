import { singleton } from 'tsyringe';
import { connect } from 'amqplib';
import { v4 } from 'uuid';
import type { Connection, Channel, Message as MQMessage } from 'amqplib';
import type { Awaited } from '../types';
import type { GatewayCallback, IRabbitEvents } from '../models';
import { PostConstruct } from '../decorators';

const RETRY_INTERVAL = 10000;

@singleton()
export class GatewayService {
	private connection!: Connection;

	private channel!: Channel;

	private queueService = `MIKO.GATEWAY.SERVICE.${process.pid}`;

	private promises: Map<string, (value: unknown) => void> = new Map();

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
		await this.channel.assertQueue(this.queueService, { durable: false, autoDelete: true });

		await this.channel.prefetch(10, true);
		await this.channel.consume(this.queueService, this.onResponse.bind(this), { noAck: false });
	}

	private async onResponse(rawMessage: MQMessage) {
		if (!rawMessage) {
			return this.assertQueues();
		}

		try {
			const message = JSON.parse(rawMessage.content.toString());

			if (this.promises.has(message.correlationId)) {
				const promise = this.promises.get(message.correlationId);

				this.promises.delete(message.correlationId);

				promise(message.data);
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

	public emit(event: string, payload: Object = null, responseId?: string): Awaited<unknown> {
		return new Promise((res, rej) => {
			const correlationId = responseId || v4();
			const content = Buffer.from(
				JSON.stringify({
					correlationId,
					replyTo: this.queueService,
					data: payload
				})
			);

			this.channel.sendToQueue(event, content);

			if (!responseId) {
				this.promises.set(correlationId, res);
			}
		});
	}

	public async on<Q extends keyof IRabbitEvents = keyof IRabbitEvents>(
		key: Q,
		listener: GatewayCallback
	): Promise<void> {
		if (!this.connection) {
			await this.init();
		}

		await this.channel.assertQueue(key, { durable: false, autoDelete: true });

		this.channel.consume(key, async (rawMessage: MQMessage) => {
			if (!rawMessage) {
				return this.assertQueues();
			}

			try {
				const message = JSON.parse(rawMessage.content.toString());

				const result = await listener(message.data);

				if (result !== false && typeof result !== 'undefined') {
					this.emit(message.replyTo, result, message.correlationId);
				}

				this.channel.ack(rawMessage, false);
			} catch (err) {
				this.channel.nack(rawMessage, false, false);
			}
		});
	}
}

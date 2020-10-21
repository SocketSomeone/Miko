import chalk from 'chalk';

import { Channel, connect, Connection, Message as MQMessage } from 'amqplib';
import { BaseService } from '../Service';

const RETRY_INTERVAL = 10000;

export abstract class RabbtMQConnection extends BaseService {
	protected conn: Connection;

	protected qName: string;
	protected channel: Channel;

	public async init() {
		if (this.client.flags.includes('--no-rabbitmq')) {
			return;
		}

		await this.initConnection();
	}

	protected async initConnection() {
		try {
			const conn = await connect(this.client.config.rabbitmq);
			this.conn = conn;
			this.conn.on('close', async (err) => {
				console.log(chalk.yellow('RabbitMQ connection closed'));

				if (err) {
					console.error(err);
				}
				await this.shutdownConnection();

				setTimeout(() => this.init(), RETRY_INTERVAL);
			});

			await this.initChannel();
		} catch (err) {
			console.error(err);

			await this.shutdownConnection();

			setTimeout(() => this.initConnection(), RETRY_INTERVAL);
		}
	}

	protected async shutdownConnection() {
		await this.shutdownChannel();

		if (this.conn) {
			try {
				await this.conn.close();
			} catch {
				// NO-OP
			}
			this.conn = null;
		}
	}

	protected async initChannel() {
		if (!this.conn) {
			return;
		}

		this.qName = `shard-Miko-${this.client.firstShardId}-${this.client.lastShardId}`;

		try {
			this.channel = await this.conn.createChannel();
			this.channel.on('error', async (err) => {
				console.log(chalk.yellow('RabbitMQ channel error'));
				console.error(err);
				await this.shutdownChannel();

				setTimeout(() => this.initChannel(), RETRY_INTERVAL);
			});

			await this.assertQueues();
		} catch (err) {
			console.error(err);

			await this.shutdownChannel();

			setTimeout(() => this.initChannel(), RETRY_INTERVAL);
		}
	}

	protected async shutdownChannel() {
		if (this.channel) {
			try {
				await this.channel.close();
			} catch {
				// NO-OP
			}

			this.channel = null;
		}
	}

	protected async assertQueues() {
		await this.channel.assertQueue(this.qName, { durable: false, autoDelete: true });

		await this.channel.assertExchange('shards_all', 'fanout', { durable: true });
		await this.channel.bindQueue(this.qName, 'shards_all', '');

		await this.channel.assertExchange('shards_one', 'topic', { durable: true });
		for (let i = this.client.firstShardId; i <= this.client.lastShardId; i++) {
			await this.channel.bindQueue(this.qName, 'shards_one', `Miko.${i}`);
		}

		await this.channel.prefetch(5);
		await this.channel.consume(this.qName, this.onShardCommand.bind(this), { noAck: false });
	}

	protected abstract async onShardCommand(msg: MQMessage): Promise<any>;
}

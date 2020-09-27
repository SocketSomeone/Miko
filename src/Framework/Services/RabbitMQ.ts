import { captureException } from '@sentry/node';
import { Channel, connect, Connection, Message as MQMessage } from 'amqplib';
import chalk from 'chalk';
import moment from 'moment';
import { GuildSettingsCache } from '../Cache';

import { Cache } from '../Decorators/Cache';
import { BaseService } from './Service';

const RETRY_INTERVAL = 10000;

interface ShardMessage {
	id: string;
	cmd: ShardCommand;

	[x: string]: any;
}

enum ShardCommand {
	CUSTOM = 'CUSTOM',
	DIAGNOSE = 'DIAGNOSE',
	FLUSH_CACHE = 'FLUSH_CACHE',
	LEAVE_GUILD = 'LEAVE_GUILD',
	STATUS = 'STATUS'
}

export class RabbitMQService extends BaseService {
	private conn: Connection;

	private qNameStartup: string;
	private channelStartup: Channel;
	private startTicket: MQMessage;
	private waitingForTicket: boolean;

	private qName: string;
	private channel: Channel;
	private msgQueue: any[] = [];

	@Cache() private guildsCache: GuildSettingsCache;

	public async init() {
		if (this.client.flags.includes('--no-rabbitmq')) {
			return;
		}

		await this.initConnection();
	}
	private async initConnection() {
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
	private async shutdownConnection() {
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

	private async initChannel() {
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

			while (this.msgQueue.length > 0) {
				await this.sendToManager(this.msgQueue.pop(), true);
			}
		} catch (err) {
			console.error(err);

			await this.shutdownChannel();

			setTimeout(() => this.initChannel(), RETRY_INTERVAL);
		}
	}
	private async shutdownChannel() {
		if (this.channel) {
			try {
				await this.channel.close();
			} catch {
				// NO-OP
			}

			this.channel = null;
		}
	}

	private async assertQueues() {
		await this.channel.assertQueue(this.qName, { durable: false, autoDelete: true });

		await this.channel.assertExchange('shards_all', 'fanout', { durable: true });
		await this.channel.bindQueue(this.qName, 'shards_all', '');

		await this.channel.assertExchange('shards_one', 'topic', { durable: true });
		for (let i = this.client.firstShardId; i <= this.client.lastShardId; i++) {
			await this.channel.bindQueue(this.qName, 'shards_one', `Miko.${i}`);
		}

		await this.channel.prefetch(5);
		await this.channel.consume(this.qName, (msg) => this.onShardCommand(msg), { noAck: false });
	}

	public async waitForStartupTicket() {
		if (!this.conn) {
			console.log(chalk.yellow('No connection available, this is ok for single installations or in dev mode.'));
			console.log(chalk.yellow('Skipping start ticket...'));
			return;
		}

		this.qNameStartup = `shard-Miko-start`;

		this.channelStartup = await this.conn.createChannel();
		this.channelStartup.on('close', async (err) => {
			this.waitingForTicket = false;

			// If we have a ticket we are probably closing the channel after startup is complete
			if (this.startTicket) {
				return;
			}

			if (err) {
				captureException(err);
				console.error(err);
			}

			console.error(chalk.red('Could not aquire startup ticket'));
			process.exit(1);
		});

		await this.channelStartup.prefetch(1);
		await this.channelStartup.assertQueue(this.qNameStartup, { durable: true, autoDelete: false, maxPriority: 10 });

		this.startTicket = null;
		this.waitingForTicket = true;

		return new Promise((resolve) => {
			this.channelStartup.consume(
				this.qNameStartup,
				(msg) => {
					console.log(chalk.green(`Aquired start ticket!`));

					this.waitingForTicket = false;

					this.startTicket = msg;
					resolve();
				},
				{ noAck: false, priority: this.client.hasStarted ? 1 : 0 }
			);
		});
	}
	public async endStartup() {
		if (!this.channelStartup) {
			return;
		}

		this.channelStartup.nack(this.startTicket, false, true);

		await this.channelStartup.close();
		this.channelStartup = null;

		this.startTicket = null;
	}

	public async sendToManager(message: { id: string; [x: string]: any }, isResend: boolean = false) {
		if (!this.conn) {
			console.log('Send message to RabbitMQ', JSON.stringify(message, null, 2));
			return;
		}

		if (!this.channel) {
			if (!isResend) {
				this.msgQueue.push(message);
			}
			return;
		}

		this.channel.sendToQueue(
			'manager',
			Buffer.from(
				JSON.stringify({
					timestamp: moment().unix(),
					firstShardId: this.client.firstShardId,
					lastShardId: this.client.lastShardId,
					shardCount: this.client.shardCount,
					service: 'bot',
					...message
				})
			)
		);
	}

	public async sendStatusToManager(err?: Error) {
		let channelCount = this.client.groupChannels.size + this.client.privateChannels.size;
		let roleCount = 0;

		this.client.guilds.forEach((g) => {
			channelCount += g.channels.size;
			roleCount += g.roles.size;
		});

		const data: any = {
			id: 'status',
			cmd: ShardCommand.STATUS,
			state: this.waitingForTicket
				? 'waiting'
				: !this.client.hasStarted
				? 'init'
				: !!this.startTicket
				? 'starting'
				: 'running',
			startedAt: this.client.startedAt.format('HH:mm:ss DD.MM.YYYY'),
			gateway: [...this.client.shardsConnected],
			error: err ? err.message : null,
			metrics: {
				...this.client.stats
			},
			service: {},
			cache: {
				guilds: this.client.guilds.size,
				users: this.client.users.size,
				channels: channelCount,
				roles: roleCount
			}
		};

		for (const [clazz, service] of this.client.services) {
			data.service[clazz.name.toLowerCase().replace('service', '')] = service.getStatus();
		}

		for (const [clazz, cache] of this.client.caches) {
			data.cache[clazz.name.toLowerCase().replace('cache', '')] = cache.size;
		}

		await this.sendToManager(data);
	}

	private async onShardCommand(msg: MQMessage) {
		// This can happen if our queue is deleted
		if (!msg) {
			console.error(chalk.yellow('Received an empty RabbitMQ message - our queue may have been deleted'));
			await this.assertQueues();
			return;
		}

		try {
			const content = JSON.parse(msg.content.toString()) as ShardMessage;
			const cmd = content.cmd;

			const guildId = content.guildId;
			const guild = this.client.guilds.get(guildId);

			console.log(`RECEIVED SHARD COMMAND: ${JSON.stringify(content)}`);

			this.channel.ack(msg, false);

			const sendResponse = (message: { [x: string]: any }) =>
				this.sendToManager({
					id: content.id,
					cmd: content.cmd,
					...message
				});

			switch (cmd) {
				case ShardCommand.STATUS:
					await this.sendStatusToManager();
					break;

				case ShardCommand.CUSTOM:
					const self = await this.client.getSelf();

					await sendResponse({
						self,
						guilds: this.client.guilds.map((g) => ({
							id: g.id,
							name: g.name,
							icon: g.iconURL,
							memberCount: g.memberCount
						}))
					});
					break;

				case ShardCommand.DIAGNOSE:
					if (!guild) {
						return sendResponse({
							error: `Guild ${guildId} not found`
						});
					}

					const owner = await this.client.getRESTUser(guild.ownerID).catch(() => undefined);
					const settings = await this.guildsCache.get(guild);
					const perms = guild.members.get(this.client.user.id).permission.json;

					const data: any = {
						owner,
						settings,
						perms,
						service: {}
					};

					for (const [clazz, service] of this.client.services) {
						data.service[clazz.name.toLowerCase().replace('service', '')] = await service.getDiagnose(guild);
					}

					await sendResponse(data);
					break;

				case ShardCommand.FLUSH_CACHE:
					const errors: string[] = [];

					this.client.flushCaches(guildId, content.caches);

					await sendResponse({ error: errors.join('\n') });
					break;

				case ShardCommand.LEAVE_GUILD:
					if (!guild) {
						return sendResponse({
							error: 'Guild not found'
						});
					}

					await guild.leave();
					await sendResponse({});
					break;

				default:
					console.error(`UNKNOWN COMMAND: ${cmd}`);
			}
		} catch (err) {
			console.error(err);
			this.channel.nack(msg, false, false);
		}
	}
}

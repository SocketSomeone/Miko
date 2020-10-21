import chalk from 'chalk';
import moment from 'moment';

import { BaseClient } from '../../../Client';
import { ShardCommand, ShardCommandType, ShardMessage } from './ShardCommands/ShardCommand';
import { Message as MQMessage } from 'amqplib';
import { RabbtMQConnection } from './RabbitMQConnection';

import ShardStatus from './ShardCommands/ShardStatus';
import FlushCache from './ShardCommands/FlushCache';
import GuildInfo from './ShardCommands/GuildInfo';

export class RabbitMQService extends RabbtMQConnection {
	private cmds: Map<ShardCommandType, ShardCommand> = new Map();

	public async init() {
		this.initCommands();

		await super.init();
	}

	protected async onShardCommand(msg: MQMessage) {
		if (!msg) {
			console.error(chalk.yellow('Received an empty RabbitMQ message - our queue may have been deleted'));
			await this.assertQueues();
			return;
		}

		try {
			const content = JSON.parse(msg.content.toString()) as ShardMessage;
			const cmd = this.cmds.get(content.cmd);

			this.channel.ack(msg, false);

			if (!cmd) {
				return console.error(`UNKNOWN COMMAND: ${cmd}`);
			}

			await cmd.execute(content, (message: { [x: string]: any }) =>
				this.sendToManager({
					id: content.id,
					cmd: content.cmd,
					...message
				})
			);
		} catch (err) {
			console.error(err);
			this.channel.nack(msg, false, false);
		}
	}

	public async sendToManager(message: ShardMessage) {
		if (!this.conn) {
			console.log('Send message to RabbitMQ', JSON.stringify(message, null, 2));
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

	private initCommands() {
		this.registerCommand(FlushCache);
		this.registerCommand(GuildInfo);
		this.registerCommand(ShardStatus);
	}

	private registerCommand<T extends ShardCommand>(module: new (rabbit: this, client: BaseClient) => T) {
		const command = new module(this, this.client);

		this.cmds.set(command.cmd, command);
	}
}

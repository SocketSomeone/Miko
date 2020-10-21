import { BaseClient } from '../../../../Client';
import { RabbitMQService } from '../RabbitMQ';

export interface ShardMessage {
	id: string;
	cmd: ShardCommandType;

	[x: string]: any;
}

export enum ShardCommandType {
	CUSTOM = 'CUSTOM',
	DIAGNOSE = 'DIAGNOSE',
	FLUSH_CACHE = 'FLUSH_CACHE',
	LEAVE_GUILD = 'LEAVE_GUILD',
	STATUS = 'STATUS',
	GUILD_INFO = 'GUILD_INFO'
}

export type responseFunc = (message: { [x: string]: any }) => Promise<any>;

export abstract class ShardCommand {
	public abstract cmd: ShardCommandType;

	protected client: BaseClient;
	protected rabbit: RabbitMQService;

	public constructor(rabbit: RabbitMQService, client: BaseClient) {
		this.client = client;
		this.rabbit = rabbit;
	}

	public async sendToManager(message: ShardMessage) {
		this.rabbit.sendToManager(message);
	}

	public abstract async execute(message: ShardMessage, res: responseFunc): Promise<any>;
}

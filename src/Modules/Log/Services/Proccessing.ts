import { BaseService } from '../../../Framework/Services/Service';
import { EventEmitter } from 'typeorm/platform/PlatformTools';
import { BaseClient } from '../../../Client';
import { LogType } from './Handle';
import { TextChannel } from 'eris';

export type ProcessFuncs = { [key in LogType]: (channel: TextChannel, ...args: any[]) => Promise<void> };

export class ProcessingLogs {
	private client: BaseClient;

	public constructor(client: BaseClient) {
		this.client = client;
	}

	public funcs: ProcessFuncs = {
		[LogType.BAN]: null,
		[LogType.UNBAN]: null,

		[LogType.CHANNEL_CREATE]: null,
		[LogType.CHANNEL_DELETE]: null,

		[LogType.EMOJI_CREATE]: null,
		[LogType.EMOJI_UPDATE]: null,
		[LogType.EMOJI_DELETE]: null,

		[LogType.ROLE_CREATE]: null,
		[LogType.ROLE_DELETE]: null,
		[LogType.ROLE_UPDATE]: null
	};
}

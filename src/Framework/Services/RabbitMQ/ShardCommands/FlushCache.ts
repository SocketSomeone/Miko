import { responseFunc, ShardCommand, ShardCommandType, ShardMessage } from './ShardCommand';

export default class extends ShardCommand {
	public cmd = ShardCommandType.FLUSH_CACHE;

	public async execute({ guildId, caches }: ShardMessage, sendResponse: responseFunc) {
		const errors: string[] = [];

		this.client.flushCaches(guildId, caches);

		await sendResponse({ error: errors.join('\n') });
	}
}

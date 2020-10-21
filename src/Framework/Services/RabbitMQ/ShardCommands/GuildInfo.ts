import { Guild } from 'eris';
import { responseFunc, ShardCommand, ShardCommandType, ShardMessage } from './ShardCommand';

export default class extends ShardCommand {
	public cmd = ShardCommandType.GUILD_INFO;

	public async execute({ guildId }: ShardMessage, sendResponse: responseFunc) {
		let guild = this.client.guilds.get(guildId);

		if (guild) {
			return sendResponse({
				guild
			});
		}

		guild = await this.client.getRESTGuild(guildId).catch(() => null);

		return sendResponse({
			guild
		});
	}
}

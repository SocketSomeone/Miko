import type { ICacheDeleteRequest } from './CacheDeleteRequest';
import type { IGuildInfoRequest, GuildInfoDTO } from './GuildInfoRequest';
import type { CommandsGetDTO } from './CommandsGetRequest';

export interface IRabbitEvents {
	GUILD_INFO: IGuildInfoRequest;
	COMMANDS_GET: null;
	CACHE_DELETE: ICacheDeleteRequest;
}

export { GuildInfoDTO, CommandsGetDTO };

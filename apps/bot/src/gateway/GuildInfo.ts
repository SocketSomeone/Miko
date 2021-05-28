import { injectable } from 'tsyringe';
import { BaseQueueListner } from '@miko/framework';
import type { IRabbitEvents, GuildInfoDTO } from '@miko/common';
@injectable()
export class GuildInfo extends BaseQueueListner<'GUILD_INFO'> {
	public constructor() {
		super('GUILD_INFO');
	}

	public async execute({ guildId }: IRabbitEvents['GUILD_INFO']): Promise<GuildInfoDTO> {
		const guild =
			this.client.guilds.resolve(guildId) || (await this.client.guilds.fetch(guildId, true).catch(() => undefined));

		return guild || null;
	}
}

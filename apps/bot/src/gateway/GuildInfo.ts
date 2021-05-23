import { injectable } from 'tsyringe';
import { BaseQueueListner } from '@miko/framework';
import type { IRabbitEvents, GuildInfoDTO } from '@miko/common';
import type { Guild, GuildPreview } from 'discord.js';

@injectable()
export class GuildInfo extends BaseQueueListner<'GUILD_INFO'> {
	public constructor() {
		super('GUILD_INFO');
	}

	public async execute({ guildId, preview }: IRabbitEvents['GUILD_INFO']): Promise<GuildInfoDTO> {
		const guild: Promise<Guild | GuildPreview> | Guild = preview
			? this.client.fetchGuildPreview(guildId)
			: this.client.guilds.resolve(guildId) || this.client.guilds.fetch(guildId);

		return Promise.resolve(guild).catch(() => ({ id: null }));
	}
}

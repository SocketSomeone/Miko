import { BaseCache } from './Cache';
import { GuildSettings, Defaults } from '../../Misc/Models/GuildSetting';
import { BaseGuild } from '../../Entity/Guild';
import { createQueryBuilder } from 'typeorm';
import { Guild } from 'eris';

export class GuildSettingsCache extends BaseCache<GuildSettings> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<GuildSettings> {
		const { sets } = await BaseGuild.get(guildId, ['sets']);

		return this.merge(Defaults, sets);
	}

	public async updateOne(guild: Guild) {
		const sets = this.cache.get(guild.id);

		await BaseGuild.update(guild.id, { sets });

		return sets;
	}
}

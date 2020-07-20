import { BaseCache } from './Cache';
import { GuildSettings, Defaults } from '../../Misc/Models/GuildSetting';
import { Guild } from '../../Entity/Guild';

export class GuildSettingsCache extends BaseCache<GuildSettings> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<GuildSettings> {
		const { sets } = await Guild.findOne(guildId);

		return { ...Defaults, ...sets };
	}
}

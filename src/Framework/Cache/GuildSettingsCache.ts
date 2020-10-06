import { BaseCache } from './Cache';
import { BaseSettings } from '../../Entity/GuildSettings';
import { Guild } from 'eris';

export class GuildSettingsCache extends BaseCache<BaseSettings> {
	public async init() {
		// NO-OP
	}

	public async get(guild: Guild): Promise<BaseSettings>;

	public async get<T>(guild: Guild): Promise<T> {
		return super.get(guild) as any;
	}

	public async _get(guild: Guild): Promise<BaseSettings> {
		let sets = await BaseSettings.findOne(guild.id);

		return sets ? sets : BaseSettings.create({ id: guild.id });
	}
}

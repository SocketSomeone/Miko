import { Guild } from 'eris';
import { PunishmentConfig } from '../../../Misc/Enums/Violation';
import { BaseCache } from '../../../Framework/Cache';
import { BaseGuild } from '../../../Entity/Guild';

export class PunishmentsCache extends BaseCache<PunishmentConfig[]> {
	public async init() {
		// NO-OP
	}

	public async _get(guild: Guild): Promise<PunishmentConfig[]> {
		const { punishmentConfig } = await BaseGuild.get(guild, ['punishmentConfig']);

		return punishmentConfig;
	}
}

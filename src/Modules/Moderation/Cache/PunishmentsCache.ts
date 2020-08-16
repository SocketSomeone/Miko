import { Guild } from 'eris';
import { PunishmentConfig } from '../../../Misc/Enums/Violation';
import { BaseCache } from '../../../Framework/Cache';
import { BaseGuild } from '../../../Entity/Guild';

export class PunishmentsCache extends BaseCache<PunishmentConfig[]> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<PunishmentConfig[]> {
		const { punishmentConfig } = await BaseGuild.get(guildId, ['punishmentConfig']);

		return punishmentConfig;
	}

	public async updateOne(guild: Guild) {
		const punishmentConfig = this.cache.get(guild.id);

		await BaseGuild.update(guild.id, { punishmentConfig });

		return punishmentConfig;
	}
}

import { BaseCache } from './Cache';
import { GuildSettings, Defaults } from '../../Misc/Models/GuildSetting';
import { Guild } from '../../Entity/Guild';
import { Permission } from '../../Misc/Models/Permisson';

export class PermissionsCache extends BaseCache<Permission[]> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<Permission[]> {
		const { permissions } = await Guild.findOne(guildId);

		return permissions;
	}
}

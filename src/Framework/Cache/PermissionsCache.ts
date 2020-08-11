import { BaseCache } from './Cache';
import { BaseGuild } from '../../Entity/Guild';
import { Permission } from '../../Misc/Models/Permisson';

export class PermissionsCache extends BaseCache<Permission[]> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<Permission[]> {
		const { permissions } = await BaseGuild.get(guildId, ['permissions']);

		return permissions;
	}
}

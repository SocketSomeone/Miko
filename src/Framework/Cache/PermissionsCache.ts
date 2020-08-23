import { BaseCache } from './Cache';
import { BaseGuild } from '../../Entity/Guild';
import { Permission } from '../../Misc/Models/Permisson';
import { createQueryBuilder } from 'typeorm';

export class PermissionsCache extends BaseCache<Permission[]> {
	public async init() {
		// NO-OP
	}

	public async _get(guildId: string): Promise<Permission[]> {
		const { permissions } = await BaseGuild.get(guildId, ['permissions']);

		return (permissions && this.normalizePermissions(permissions)) || [];
	}

	private normalizePermissions(permissions: Permission[]) {
		return permissions
			.sort((a, b) => a.index - b.index)
			.map((v, i) => {
				v.index = i + 1;
				return v;
			});
	}

	public async save(guildId: string, pr: Permission[]) {
		const permissions = this.normalizePermissions(pr);

		this.set(guildId, permissions);

		await createQueryBuilder(BaseGuild)
			.update()
			.set({
				permissions
			})
			.where('id = :guildId', { guildId })
			.execute();
	}
}

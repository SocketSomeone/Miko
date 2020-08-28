import { BaseCache } from '../../../Framework/Cache';
import { BaseReactionRole } from '../../../Entity/ReactionRole';
import { Guild } from 'eris';
import { BaseShopRole } from '../../../Entity/ShopRole';

export class ShopRolesCache extends BaseCache<BaseShopRole[]> {
	public async init() {
		// NO-OP
	}

	protected async _get(guild: Guild): Promise<BaseShopRole[]> {
		const roles = await BaseShopRole.find({
			where: {
				guild: {
					id: guild.id
				}
			},
			order: {
				cost: 'ASC',
				createdAt: 'ASC'
			}
		});

		return roles;
	}
}

import { BaseCache } from '../../../Framework/Cache';
import { BaseReactionRole } from '../../../Entity/ReactionRole';

export class ReactionRoleCache extends BaseCache<BaseReactionRole[]> {
	public async init() {
		// TODO
	}

	protected async _get(guildId: string): Promise<BaseReactionRole[]> {
		const arr = await BaseReactionRole.find({
			where: {
				guildId
			}
		});

		return arr;
	}
}

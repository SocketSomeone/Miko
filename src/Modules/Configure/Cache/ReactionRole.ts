import { BaseCache } from '../../../Framework/Cache';
import { BaseReactionRole } from '../../../Entity/ReactionRole';
import { Guild } from 'eris';

export class ReactionRoleCache extends BaseCache<BaseReactionRole[]> {
	public async init() {
		// TODO
	}

	protected async _get(guild: Guild): Promise<BaseReactionRole[]> {
		const arr = await BaseReactionRole.find({
			where: {
				guildId: guild.id
			}
		});

		return arr;
	}
}

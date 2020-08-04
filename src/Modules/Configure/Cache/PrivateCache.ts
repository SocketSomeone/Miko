import { BaseCache } from '../../../Framework/Cache';
import { BasePrivate } from '../../../Entity/Privates';

export class PrivatesCache extends BaseCache<BasePrivate> {
	public async init() {
		// NO-OP
	}

	public async _get(channelID: string): Promise<BasePrivate> {
		const pr = await BasePrivate.findOne(channelID);

		return pr || null;
	}
}

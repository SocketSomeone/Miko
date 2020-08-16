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

	public async add(object: Partial<BasePrivate>) {
		const pr = await BasePrivate.save(BasePrivate.create(object));

		this.set(pr.id, pr);
	}

	public async delete(pr: BasePrivate) {
		this.flush(pr.id);
		await pr.remove();
	}
}

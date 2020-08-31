import { BaseCache } from '../../../Framework/Cache';
import { BasePrivate } from '../../../Entity/Privates';
import { Guild } from 'eris';

export class PrivatesCache extends BaseCache<Map<string, BasePrivate>> {
	public async init() {
		// NO-OP
	}

	public async _get({ id }: Guild): Promise<Map<string, BasePrivate>> {
		const rooms = await BasePrivate.find({
			where: {
				guild: id
			}
		});

		return new Map(rooms.map((r) => [r.id, r]));
	}

	public async add(object: Partial<BasePrivate>) {
		const room = await BasePrivate.save(BasePrivate.create(object));
		const rooms = await this.get({ id: room.guild });

		rooms.set(room.id, room);

		return room;
	}

	public async delete(room: BasePrivate) {
		const rooms = await this.get({ id: room.guild });

		rooms.delete(room.id);

		await room.remove();
	}
}

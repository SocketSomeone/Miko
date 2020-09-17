import { BaseCache } from '../../../Framework/Cache';
import { BasePrivate } from '../../../Entity/Privates';
import { Guild, VoiceChannel } from 'eris';

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
		const room = await BasePrivate.create(object).save();
		const rooms = await this.get({ id: room.guild });

		rooms.set(room.id, room);

		return room;
	}

	public async delete(channel: VoiceChannel) {
		const rooms = await this.get({ id: channel.guild.id });
		const room = rooms.get(channel.id);

		rooms.delete(room.id);

		await channel.delete('Empty private room').catch(() => undefined);
		await room.remove().catch(() => undefined);
	}
}

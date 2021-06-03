import type { Channel, Guild } from 'discord.js';
import { BaseArgument } from '../models';

const channelRegex = /^(?:<#)?(\d+)>?$/;

export class ChannelArgument extends BaseArgument<Channel> {
	public async resolve(value: string, guild: Guild): Promise<Channel> {
		if (!guild || !value) {
			return;
		}

		let channel: Channel;

		if (channelRegex.test(value)) {
			const id = value.match(channelRegex)[1];
			channel = guild.channels.resolve(id);

			if (!channel) {
				throw Error('Не удалось найти канал!');
			}
		} else {
			const name = value.toLowerCase();
			const channels = guild.channels.cache.filter(r => {
				const rName = r.name.toLowerCase();
				return rName.includes(name) || name.includes(rName);
			});

			if (channels.size === 1) {
				channel = channels.first();
			} else {
				throw Error('Не удалось найти канал!');
			}
		}

		return channel;
	}
}

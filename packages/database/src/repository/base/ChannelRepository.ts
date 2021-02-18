import {Repository} from 'typeorm';
import {ChannelEntity} from '../../entity/base/ChannelEntity';

export abstract class ChannelRepository<T extends ChannelEntity> extends Repository<T> {
	abstract findByGuildAndChannelId(guildId: string, channelId: string): Promise<T[]>;

	abstract deleteByGuildIdAndChannelId(guildId: string, channelId: string): Promise<string>;

	public async exists(guildId: string, channelId: string): Promise<boolean> {
		const countOfChannels = await this.count({
			where: {
				guildId,
				channelId
			}
		});

		return countOfChannels > 0;
	}
}

import { DeleteResult, Repository } from 'typeorm';
import { ChannelEntity } from '../../entity/base/ChannelEntity';

export abstract class ChannelRepository<T extends ChannelEntity> extends Repository<T> {
	public findByGuildAndChannelId(guildId: string, channelId: string): Promise<T> {
		return this.findOne({
			where: {
				channelId,
				guildId
			}
		});
	}

	public deleteByGuildIdAndChannelId(guildId: string, channelId: string): Promise<DeleteResult> {
		return this.createQueryBuilder()
			.where('guildId = :guildId AND channelId = :channelId', { guildId, channelId })
			.delete()
			.execute();
	}

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

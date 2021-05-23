import type { DeleteResult, FindConditions } from 'typeorm';
import { Repository } from 'typeorm';
import type { BaseChannelEntity } from '../..';

export abstract class BaseChannelRepository<T extends BaseChannelEntity> extends Repository<T> {
	public findByChannelId(channelId: string): Promise<T> {
		return this.findOne({
			where: {
				channelId
			}
		});
	}

	public deleteByChannelId(channelId: string): Promise<DeleteResult> {
		return this.delete(<FindConditions<T | unknown>>{
			channelId
		});
	}

	public async exists(channelId: string): Promise<boolean> {
		const countOfChannels = await this.count({
			where: {
				channelId
			}
		});

		return countOfChannels > 0;
	}
}

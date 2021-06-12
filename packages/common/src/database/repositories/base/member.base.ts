import type { DeleteResult, FindConditions } from 'typeorm';
import { Repository } from 'typeorm';
import type { BaseMemberEntity } from '../../models';

export abstract class BaseMemberRepository<T extends BaseMemberEntity> extends Repository<T> {
	public findByGuildIdAndUserId(guildId: string, userId: string): Promise<T> {
		return this.findOne({
			where: {
				userId,
				guildId
			}
		});
	}

	public findAllByGuildIdAndUserId(guildId: string, userId: string): Promise<T[]> {
		return this.find({
			where: {
				userId,
				guildId
			}
		});
	}

	public deleteByGuildIdAndUserId(guildId: string, userId: string): Promise<DeleteResult> {
		return this.delete(<FindConditions<T | unknown>>{
			userId,
			guildId
		});
	}
}

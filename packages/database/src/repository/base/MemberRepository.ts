import type { DeleteResult, FindConditions } from 'typeorm';
import { Repository } from 'typeorm';
import type { MemberEntity } from '../..';

export abstract class MemberRepository<T extends MemberEntity> extends Repository<T> {
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

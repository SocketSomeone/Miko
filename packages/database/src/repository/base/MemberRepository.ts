import { DeleteResult, Repository } from 'typeorm';
import { MemberEntity } from '../../entity/base/MemberEntity';

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
		return this.createQueryBuilder()
			.where('guildId = :guildId AND userId = :userId', { guildId, userId })
			.delete()
			.execute();
	}
}

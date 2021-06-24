import { Repository } from 'typeorm';
import type { BaseUserEntity } from '../../entities';

export abstract class BaseUserRepository<T extends BaseUserEntity> extends Repository<T> {
	public findByUserId(userId: string): Promise<T> {
		return this.findOne({
			where: { userId }
		});
	}
}

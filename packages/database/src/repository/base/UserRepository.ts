import { Repository } from 'typeorm';
import { UserEntity } from '../../entity/base/UserEntity';

export abstract class UserRepository<T extends UserEntity> extends Repository<T> {
	public findByUserId(userId: string): Promise<T> {
		return this.findOne({
			where: { userId }
		});
	}
}

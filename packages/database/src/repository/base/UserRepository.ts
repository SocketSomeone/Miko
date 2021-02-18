import {Repository} from 'typeorm';
import {UserEntity} from '../../entity/base/UserEntity';

export abstract class UserRepository<T extends UserEntity> extends Repository<T> {
	abstract findByUserId(userId: string): Promise<T>;
}

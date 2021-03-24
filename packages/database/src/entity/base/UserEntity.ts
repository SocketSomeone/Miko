import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export abstract class UserEntity extends BaseEntity {
	@Column('bigint', { name: 'user_id' })
	public userId!: string;
}

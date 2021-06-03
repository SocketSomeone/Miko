import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export abstract class BaseUserEntity extends BaseEntity {
	@Column('bigint', { name: 'user_id' })
	public userId!: string;
}

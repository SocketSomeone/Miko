import {Column} from 'typeorm';
import {MiEntity} from './BaseEntity';

export abstract class UserEntity extends MiEntity {
	@Column('bigint', {name: 'user_id'})
	public userId!: string;
}

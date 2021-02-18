import {Column, Entity, UpdateDateColumn} from 'typeorm';
import {UserEntity} from './base/UserEntity';

@Entity({name: 'users'})
export class MiUser extends UserEntity {
	@Column()
	public username!: string;

	@Column()
	public discriminator!: string;

	@Column()
	public avatarUrl!: string;

	@UpdateDateColumn()
	private lastUpdate!: Date;
}

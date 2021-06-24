import { Column, Entity } from 'typeorm';
import { BaseUserEntity } from './base';

@Entity({ name: 'users' })
export class User extends BaseUserEntity {
	@Column()
	public username!: string;

	@Column()
	public discriminator!: string;

	@Column()
	public avatarUrl!: string;
}

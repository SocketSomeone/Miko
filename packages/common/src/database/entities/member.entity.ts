import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseGuildEntity } from './base/guild.base';
import { User } from './user.entity';

@Entity({ name: 'members' })
export class Member extends BaseGuildEntity {
	@ManyToOne(() => User, user => user.userId)
	@JoinColumn({ name: 'user_id' })
	public user!: User;

	@Column('varchar', { nullable: true })
	public displayName?: string;
}

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseGuildEntity } from './base/GuildEntity';
import { User } from './User';

@Entity({ name: 'members' })
export class Member extends BaseGuildEntity {
	@ManyToOne(() => User, user => user.userId)
	@JoinColumn({ name: 'user_id' })
	public user!: User;

	@Column('varchar', { nullable: true })
	public displayName?: string;
}

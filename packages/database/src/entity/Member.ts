import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { GuildEntity } from './base/GuildEntity';
import { BaseUser } from './User';

@Entity({ name: 'members' })
export class BaseMember extends GuildEntity {
	@ManyToOne(() => BaseUser, user => user.userId)
	@JoinColumn({ name: 'user_id' })
	public user!: BaseUser;

	@Column('varchar', { nullable: true })
	public displayName?: string;
}

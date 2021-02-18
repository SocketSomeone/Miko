import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {GuildEntity} from './base/GuildEntity';
import {MiUser} from './User';

@Entity({name: 'members'})
export class MiMember extends GuildEntity {
	@ManyToOne(() => MiUser, (user) => user.userId)
	@JoinColumn({name: 'user_id'})
	public user!: MiUser;

	@Column('varchar', {nullable: true})
	public displayName?: string;
}

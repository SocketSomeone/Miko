import { Entity, BaseEntity, ManyToOne, PrimaryColumn, JoinColumn, Column } from 'typeorm';
import { Guild } from './Guild';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
	public id: string;

	@ManyToOne((type) => Guild, (g) => g.members)
	@JoinColumn()
	public guild: Guild;
}

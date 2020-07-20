import { Entity, BaseEntity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Guild } from './Guild';

@Entity()
export class Member extends BaseEntity {
	@PrimaryColumn()
	public id: string;

	@ManyToOne((type) => Guild, (g) => g.members)
	@JoinColumn()
	public guild: Guild;
}

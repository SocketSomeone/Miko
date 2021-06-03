import { Column, Entity } from 'typeorm';
import { BaseEntity } from './base/BaseEntity';

interface ILink {
	emoji: string;
	url: string;
}

@Entity()
export class Contributor extends BaseEntity {
	@Column('varchar')
	public avatarUrl: string;

	@Column('varchar')
	public username: string;

	@Column('varchar')
	public specialization: string;

	@Column('json')
	public links: ILink[];
}

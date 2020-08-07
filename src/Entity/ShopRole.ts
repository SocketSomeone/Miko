import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	PrimaryColumn,
	BeforeInsert
} from 'typeorm';
import { BaseGuild } from './Guild';
import BigNumber from 'bignumber.js';

@Entity()
export class BaseShopRole extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ type: 'bigint', default: 0n })
	public cost: bigint;

	@CreateDateColumn()
	public createdAt: Date;
}

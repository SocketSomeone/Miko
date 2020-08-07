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
import { BigIntTransformer } from './Transformers';

@Entity()
export class BaseShopRole extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ type: 'bigint', default: 0n, transformer: BigIntTransformer })
	public cost: bigint;

	@CreateDateColumn()
	public createdAt: Date;
}

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
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';
import { snowFlakeID } from './Snowflakes/SnowflakeID';

export enum ScheduledAction {
	UNMUTE = 'unmute',
	UNBAN = 'unban'
}

@Entity()
export class BaseScheduledAction extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id: bigint;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ nullable: true, transformer: DateTransformer, type: 'timestamp without time zone' })
	public date: Moment;

	@Column({ type: 'varchar', nullable: false })
	public type: ScheduledAction;

	@Column({ type: 'json' })
	public args: { [key: string]: any };

	@CreateDateColumn()
	public createdAt: Date;
}

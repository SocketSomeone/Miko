import {
	BaseEntity,
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	PrimaryColumn
} from 'typeorm';
import { Embed } from 'eris';

@Entity()
export class BaseMessage extends BaseEntity {
	@PrimaryColumn({ type: 'bigint' })
	public id: string;

	@Column({ type: 'bigint' })
	public guildId: string;

	@Column({ type: 'bigint' })
	public channelId: string;

	@Column({ type: 'varchar' })
	public content: string;

	@Column({ type: 'json' })
	public embeds: Embed[];

	@CreateDateColumn()
	public createdAt: Date;
}

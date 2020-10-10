import { BaseEntity, Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { BaseGuild } from './Guild';
import { Moment } from 'moment';
import { DateTransformer } from './Transformers';

export enum Punishment {
	BAN = 'ban',
	KICK = 'kick',
	SOFTBAN = 'softban',
	MUTE = 'mute',
	WARN = 'warn'
}

@Entity()
export class BasePunishment extends BaseEntity {
	@PrimaryGeneratedColumn({ type: 'bigint' })
	public id: bigint;

	@ManyToOne((type) => BaseGuild, (g) => g.id, { eager: true, nullable: false, onDelete: 'NO ACTION', cascade: true })
	@JoinColumn()
	public guild: BaseGuild;

	@Column({ nullable: true })
	public duration: number;

	@Column({ type: 'varchar', nullable: false })
	public type: Punishment;

	@Column({ type: 'varchar', nullable: true })
	public reason: string;

	@Column({ type: 'bigint', nullable: false })
	public member: string;

	@Column({ type: 'bigint', nullable: false })
	public moderator: string;

	@CreateDateColumn()
	public createdAt: Date;

	public static async savePunishment(data: Partial<BasePunishment>) {
		await this.create(data).save();
	}
}

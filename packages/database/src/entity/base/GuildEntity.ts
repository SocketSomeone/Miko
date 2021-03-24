import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

export abstract class GuildEntity extends BaseEntity {
	@Column('bigint', { name: 'guild_id' })
	public guildId!: string;
}

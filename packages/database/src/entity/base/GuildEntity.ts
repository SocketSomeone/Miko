import { Column } from 'typeorm';
import { MiEntity } from './BaseEntity';

export abstract class GuildEntity extends MiEntity {
	@Column('bigint', { name: 'guild_id' })
	public guildId!: string;
}

import { Column } from 'typeorm';
import { BaseEntity } from './entity.base';

export abstract class BaseGuildEntity extends BaseEntity {
	@Column('bigint', { name: 'guild_id' })
	public guildId!: string;
}

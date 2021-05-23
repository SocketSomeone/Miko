import { Column } from 'typeorm';
import { BaseGuildEntity } from './GuildEntity';

export abstract class BaseMemberEntity extends BaseGuildEntity {
	@Column('bigint', { name: 'user_id' })
	public userId!: string;
}

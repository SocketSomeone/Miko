import { Column } from 'typeorm';
import { BaseGuildEntity } from './GuildEntity';

export abstract class BaseChannelEntity extends BaseGuildEntity {
	@Column('bigint', { name: 'channel_id' })
	public channelId!: string;
}

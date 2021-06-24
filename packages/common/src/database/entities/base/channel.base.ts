import { Column } from 'typeorm';
import { BaseGuildEntity } from './guild.base';

export abstract class BaseChannelEntity extends BaseGuildEntity {
	@Column('bigint', { name: 'channel_id' })
	public channelId!: string;
}

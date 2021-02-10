import { Column } from 'typeorm';
import { GuildEntity } from './GuildEntity';

export abstract class ChannelEntity extends GuildEntity {
    @Column('bigint', { name: 'channel_id' })
    public channelId!: string;
}

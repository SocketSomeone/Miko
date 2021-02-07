import { Column } from 'typeorm';
import { GuildEntity } from './GuildEntity';

export abstract class ChannelEntity<T> extends GuildEntity<T> {
    @Column("bigint", { name: 'channel_id' })
    public channelId!: string;
}
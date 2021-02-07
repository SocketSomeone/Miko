import { Column } from 'typeorm';
import { GuildEntity } from './GuildEntity';

export abstract class MemberEntity<T> extends GuildEntity<T> {
    @Column("bigint", { name: 'user_id' })
    public userId!: string;
}
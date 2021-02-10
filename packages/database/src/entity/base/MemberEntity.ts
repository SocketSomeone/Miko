import { Column } from 'typeorm';
import { GuildEntity } from './GuildEntity';

export abstract class MemberEntity extends GuildEntity {
    @Column('bigint', { name: 'user_id' })
    public userId!: string;
}

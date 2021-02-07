import { Column } from 'typeorm';
import { MiEntity } from './BaseEntity';

export abstract class GuildEntity<T> extends MiEntity<T> {
    @Column("bigint", { name: "guild_id" })
    public guildId!: string;
}

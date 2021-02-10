import { Repository } from 'typeorm';
import { GuildEntity } from '../../entity/base/GuildEntity';

export abstract class GuildRepository<T extends GuildEntity> extends Repository<T> {
    abstract findByGuildId(guildId: string): Promise<T>;

    abstract findAllByGuildId(guildId: string): Promise<T[]>;

    abstract existsByGuildId(guildId: string): Promise<boolean>;
}

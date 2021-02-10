import { Repository } from 'typeorm';
import { MemberEntity } from '../../entity/base/MemberEntity';

export abstract class MemberRepository<T extends MemberEntity> extends Repository<T> {
    abstract findByGuildIdAndUserId(guildId: string, userId: string): Promise<T>;

    abstract findAllByGuildIdAndUserId(guildId: string, userId: string): Promise<T[]>;

    abstract deleteByGuildIdAndUserId(guildId: string, userId: string): Promise<void>;
}

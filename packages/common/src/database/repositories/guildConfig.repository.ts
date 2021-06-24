import { EntityRepository } from 'typeorm';
import { GuildConfig } from '../entities';
import { BaseGuildRepository } from './base';

@EntityRepository(GuildConfig)
export class GuildConfigRepository extends BaseGuildRepository<GuildConfig> {
	public async findPrefixByGuildId(guildId: string): Promise<string> {
		const data = await this.findOne({
			select: ['prefix'],
			where: {
				guildId
			}
		});

		return data?.prefix || '!';
	}

	public async findLocaleByGuildId(guildId: string): Promise<string> {
		const data = await this.findOne({
			select: ['locale'],
			where: {
				guildId
			}
		});

		return data?.locale || 'en';
	}
}

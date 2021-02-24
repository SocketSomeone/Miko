import { EntityRepository } from 'typeorm';
import { GuildConfig } from '../entity';
import { GuildRepository } from './base';

@EntityRepository(GuildConfig)
export class GuildConfigRepository extends GuildRepository<GuildConfig> {
	public async findPrefixByGuildId(guildId: string): Promise<string> {
		const data = await this.findOne({
			select: ['prefix'],
			where: {
				guildId
			}
		});

		return (data && data.prefix) || '!';
	}

	public async findLocaleByGuildId(guildId: string): Promise<string> {
		const data = await this.findOne({
			select: ['locale'],
			where: {
				guildId
			}
		});

		return (data && data.locale) || 'en';
	}
}

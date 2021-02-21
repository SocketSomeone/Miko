import { singleton } from 'tsyringe';
import { GuildConfig } from '../entity';
import { GuildRepository } from './base/GuildRepository';

@singleton()
export class GuildConfigRepository extends GuildRepository<GuildConfig> {
	public async findPrefixByGuildId(guildId: string): Promise<string> {
		const { prefix } = await this.findOne({
			select: ['prefix'],
			where: {
				guildId
			}
		});

		return prefix || '!';
	}

	public async findLocaleByGuildId(guildId: string): Promise<string> {
		const { locale } = await this.findOne({
			select: ['prefix'],
			where: {
				guildId
			}
		});

		return locale || 'en';
	}
}

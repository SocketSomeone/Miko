import type { DeepPartial } from '@miko/database';
import { GuildConfig, GuildConfigRepository } from '@miko/database';
import { singleton } from 'tsyringe';
import { BaseService } from './base';

@singleton()
export class ConfigService extends BaseService<GuildConfig, GuildConfigRepository> {
	public constructor() {
		super(GuildConfig, GuildConfigRepository);
	}

	public async getPrefix(guildId: string): Promise<string> {
		return this.repository.findPrefixByGuildId(guildId);
	}

	public async getLocale(guildId: string): Promise<string> {
		return this.repository.findLocaleByGuildId(guildId);
	}

	protected createNew(guildId: string): DeepPartial<GuildConfig> {
		return this.repository.create({
			guildId
		});
	}
}

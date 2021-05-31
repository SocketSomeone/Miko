import { singleton } from 'tsyringe';
import type { DeepPartial } from 'typeorm';
import { GuildConfig, GuildConfigRepository } from '../database';
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

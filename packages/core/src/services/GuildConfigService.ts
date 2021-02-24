import { DeepPartial, GuildConfig, GuildConfigRepository } from '@miko/database';
import { singleton } from 'tsyringe';
import { MiService } from './base/MiService';

@singleton()
export class ConfigService extends MiService<GuildConfig, GuildConfigRepository> {
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
		return new GuildConfig(guildId);
	}
}

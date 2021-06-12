import type { DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { GuildConfig } from '../database/models';
import { CacheManager } from './cache-manager.service';
import { DomainService } from './base';
import { GuildConfigRepository } from '../database';

@Injectable()
export class GuildConfigService extends DomainService<GuildConfig, GuildConfigRepository> {
	public constructor(
		@InjectRepository(GuildConfigRepository) protected repository: GuildConfigRepository,
		protected cacheManager: CacheManager
	) {
		super(GuildConfig);
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

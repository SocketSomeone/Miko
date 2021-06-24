import { Injectable } from '@nestjs/common';
import { GuildConfigService, SentryService } from '@miko/common';
import type { GuildConfig } from '@miko/common';
import type { Guild } from 'discord.js';

@Injectable()
export class DiscordEntityAccessor {
	public constructor(private guildConfigService: GuildConfigService, private sentryService: SentryService) {}

	public async getConfig(guild: Guild): Promise<GuildConfig> {
		const config = await this.guildConfigService.getOrCreate(guild.id);

		try {
			let shouldSave = false;

			if (config.name !== guild.name) {
				config.name = guild.name;
				shouldSave = true;
			}

			if (config.iconURL !== guild.icon) {
				config.iconURL = guild.icon;
				shouldSave = true;
			}

			return shouldSave ? this.guildConfigService.save(config) : config;
		} catch (err) {
			this.sentryService.error(`Failed update guild ${guild.name} [${guild.id}]`);
		}
	}
}

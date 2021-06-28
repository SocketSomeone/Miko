/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { OnApplicationBootstrap } from '@nestjs/common';
import { Inject, Logger, Injectable } from '@nestjs/common';
import { Guild, Client, CloseEvent } from 'discord.js';

import { On, Once } from './decorators';
import { DISCORD_MODULE_OPTIONS } from './discord.constants';
import type { IDiscordModuleOptions } from './interfaces';

@Injectable()
export class DiscordClientProvider extends Client implements OnApplicationBootstrap {
	private logger = new Logger(DiscordClientProvider.name);

	public constructor(
		@Inject(DISCORD_MODULE_OPTIONS)
		private moduleOptions: IDiscordModuleOptions
	) {
		super(moduleOptions);
	}

	public async onApplicationBootstrap(): Promise<void> {
		try {
			await this.login();
		} catch (err) {
			this.logger.error('Failed to connect to Discord API');
			this.logger.error(err);
		}
	}

	@On('debug')
	public onDebug(info: string): void {
		this.logger.debug(info);
	}

	@Once('ready')
	public onClientReady(): void {
		this.logger.log(`Client is ready! Serving ${this.guilds.cache.size} guilds...`);
	}

	@Once('shardReady')
	public onShardReady(shardId: number): void {
		this.logger.log('Ready to work!', `SHARD ${shardId + 1}`);
	}

	@On('shardReconnecting')
	public onShardReconnecting(shardId: number): void {
		this.logger.log('Connected to Discord!', `SHARD ${shardId + 1}`);
	}

	@On('shardResume')
	public onShardResume(shardId: number): void {
		this.logger.log('Connection resumed...', `SHARD ${shardId + 1}`);
	}

	@On('shardDisconnect')
	public onShardDisconnect(err: CloseEvent, shardId: number): void {
		this.logger.warn(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
	}

	@On('warn')
	public onWarn(warn: string): void {
		this.logger.warn(warn, 'DISCORD WARNING');
	}

	@On('error', 'shardError')
	public onError(error: Error): void {
		this.logger.error(error, 'DISCORD WARNING');
	}

	@On('rateLimit')
	public onRatelimit(): void {
		this.logger.warn('Rate limit exceed', 'DISCORD WARNING');
	}

	@On('guildUnavailable')
	public onGuildUnavailable(guild: Guild): void {
		this.logger.warn(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
	}
}

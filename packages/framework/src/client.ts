import type { Guild } from 'discord.js';
import { Client as DClient } from 'discord.js';
import { singleton } from 'tsyringe';
import { PostConstruct, createConnection, EmergencyService, GatewayService } from '@miko/common';
import { config } from '@miko/config';
import { CommandHolderService } from './services';

@singleton()
export class Client extends DClient {
	public constructor(
		private emergencyService: EmergencyService,
		private gatewayService: GatewayService,
		private commandHolderService: CommandHolderService
	) {
		super({
			disableMentions: 'everyone',
			messageEditHistoryMaxSize: 50,
			messageCacheMaxSize: 100,
			messageCacheLifetime: 240,
			messageSweepInterval: 250,
			fetchAllMembers: true,
			presence: {
				activity: {
					name: 'mikoapp.xyz | !help',
					type: 'WATCHING',
					url: 'https://mikoapp.xyz'
				},
				status: 'online'
			},
			ws: {
				compress: false,
				intents: [
					'DIRECT_MESSAGES',
					'DIRECT_MESSAGE_REACTIONS',
					'GUILDS',
					'GUILD_BANS',
					'GUILD_EMOJIS',
					'GUILD_VOICE_STATES',
					'GUILD_EMOJIS',
					'GUILD_MEMBERS',
					'GUILD_MESSAGES',
					'GUILD_MESSAGE_REACTIONS'
				]
			}
		});
	}

	@PostConstruct
	public async init(): Promise<unknown> {
		this.once('ready', this.onClientReady.bind(this));

		this.once('shardReady', this.onShardReady.bind(this));
		this.on('shardResume', this.onShardResume.bind(this));
		this.on('shardReconnecting', this.onShardReconnecting.bind(this));
		this.on('shardDisconnect', this.onShardDisconnect.bind(this));

		this.on('guildUnavailable', this.onGuildUnavailable.bind(this));

		this.on('warn', this.onWarn.bind(this));
		this.on('error', this.onError.bind(this));
		this.on('shardError', this.onError.bind(this));
		this.on('rateLimit', this.onRatelimit.bind(this));

		await createConnection(config.env).catch(err => {
			this.emergencyService.error(err);
		});

		return this.login(config.bot.TOKEN).catch(err => {
			this.emergencyService.error(err);
		});
	}

	// #region Client Events
	private onClientReady() {
		this.emergencyService.info(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
	}

	private onShardReady(shardId: number) {
		this.emergencyService.info('Ready to work!', `SHARD ${shardId + 1}`);
	}

	private onShardReconnecting(shardId: number) {
		this.emergencyService.info('Connected to Discord!', `SHARD ${shardId + 1}`);
	}

	private onShardResume(shardId: number) {
		this.emergencyService.info('Connection resumed...', `SHARD ${shardId + 1}`);
	}

	private onShardDisconnect(err: CloseEvent, shardId: number) {
		this.emergencyService.warn(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
	}

	private onWarn(warn: string) {
		this.emergencyService.warn(warn, 'DISCORD WARNING');
	}

	private onError(error: Error) {
		this.emergencyService.error(error);
	}

	private onRatelimit() {
		this.emergencyService.warn('Rate limit exceed', 'DISCORD WARNING');
	}

	private onGuildUnavailable(guild: Guild) {
		this.emergencyService.warn(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
	}
	// #endregion
}

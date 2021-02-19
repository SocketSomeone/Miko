import { Client, CloseEvent, Guild } from 'discord.js';
import { Logger } from 'tslog';
import { IMikoMetrics } from './types';

export class MiClient extends Client {
	protected readonly logger = new Logger({ name: 'CLIENT' });

	public metrics: IMikoMetrics = {
		ratelimits: 0,
		shardConnects: 0,
		shardDisconnects: 0,
		shardResumes: 0,
		wsErrors: 0,
		wsWarnings: 0
	};

	public constructor() {
		super({
			disableMentions: 'everyone',
			messageEditHistoryMaxSize: 50,
			messageCacheMaxSize: 100,
			messageCacheLifetime: 240,
			messageSweepInterval: 250,
			fetchAllMembers: true,
			shards: 'auto',
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

	public async login(token?: string): Promise<string> {
		this.logger.silly('Setting up events...');
		this.once('ready', this.onClientReady);
		this.once('shardReady', this.onShardReady);

		this.on('shardResume', this.onShardResume);
		this.on('shardReconnecting', this.onShardReconnecting);
		this.on('shardDisconnect', this.onShardDisconnect);

		this.on('guildUnavailable', this.onGuildUnavailable);

		this.on('warn', this.onWarn);
		this.on('error', this.onError);
		this.on('shardError', this.onError);
		this.on('rateLimit', this.onRatelimit);

		this.logger.silly('Connecting to Discord...');
		return super.login(token);
	}

	private async onClientReady() {
		this.metrics.startedAt = new Date();
		this.logger.silly(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
	}

	private onShardReady(shardId: number) {
		this.logger.silly('Ready to work!', `SHARD ${shardId + 1}`);
	}

	private onShardReconnecting(shardId: number) {
		this.logger.silly('Connected to Discord!', `SHARD ${shardId + 1}`);
		this.metrics.shardConnects += 1;
	}

	private onShardResume(shardId: number) {
		this.logger.debug('Connection resumed...', `SHARD ${shardId + 1}`);
		this.metrics.shardResumes += 1;
	}

	private onShardDisconnect(err: CloseEvent, shardId: number) {
		this.logger.warn(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
		this.metrics.shardDisconnects += 1;
	}

	private onWarn(warn: string) {
		this.logger.warn(warn, 'DISCORD WARNING');
		this.metrics.wsWarnings += 1;
	}

	private onError(error: Error) {
		this.logger.error(error, 'DISCORD ERROR');
		this.metrics.wsErrors += 1;
	}

	private onRatelimit() {
		this.metrics.ratelimits += 1;
	}

	private onGuildUnavailable(guild: Guild) {
		this.logger.warn(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
	}
}

import { Client as DClient, CloseEvent, Guild } from 'discord.js';
import { Logger } from 'tslog';
import { container, singleton } from 'tsyringe';

@singleton()
export class Client extends DClient {
	protected readonly logger = new Logger({ name: 'CLIENT' });

	public constructor() {
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

	public async login(token: string): Promise<string> {
		this.logger.debug('Setting up events...');
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

		this.logger.debug('Connecting to Discord...');
		return super.login(token);
	}

	private async onClientReady() {
		this.logger.info(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
	}

	private onShardReady(shardId: number) {
		this.logger.info('Ready to work!', `SHARD ${shardId + 1}`);
	}

	private onShardReconnecting(shardId: number) {
		this.logger.info('Connected to Discord!', `SHARD ${shardId + 1}`);
	}

	private onShardResume(shardId: number) {
		this.logger.info('Connection resumed...', `SHARD ${shardId + 1}`);
	}

	private onShardDisconnect(err: CloseEvent, shardId: number) {
		this.logger.warn(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
	}

	private onWarn(warn: string) {
		this.logger.warn(warn, 'DISCORD WARNING');
	}

	private onError(error: Error) {
		this.logger.error(error, 'DISCORD ERROR');
	}

	private onRatelimit() {
		this.logger.warn('Rate limit exceed', 'DISCORD WARNING');
	}

	private onGuildUnavailable(guild: Guild) {
		this.logger.warn(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
	}
}

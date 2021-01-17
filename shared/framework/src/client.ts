import { Client, CloseEvent, Guild } from 'discord.js';
import { Logger } from '@miko/logger';
import { MiProvider } from './provider';
import { IMikoMetrics, MikoClientOptions } from './types';

export abstract class MiClient extends Client {
    protected logger = new Logger('CLIENT');

    public provider = new MiProvider();

    public metrics: IMikoMetrics = {
        ratelimits: 0,
        shardConnects: 0,
        shardDisconnects: 0,
        shardResumes: 0,
        wsErrors: 0,
        wsWarnings: 0,
        startedAt: null
    };

    public constructor({ modules, ...opts }: MikoClientOptions) {
        super(opts);

        this.provider.registerModule(modules);
    }

    public async login(token?: string): Promise<string> {
        this.logger.verbose('Initializing provider...');
        await this.provider.init();

        this.logger.verbose('Setting up events handler...');
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

        this.logger.verbose('Connecting to Discord GATEWAY');
        return super.login(token);
    }

    private async onClientReady() {
        await this.provider.onClientReady();

        this.metrics.startedAt = new Date();
        this.logger.verbose(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
    }

    private onShardReady(shardId: number) {
        this.logger.error('Ready to work!', `SHARD ${shardId + 1}`);
    }

    private onShardReconnecting(shardId: number) {
        this.logger.error('Connected to Discord!', `SHARD ${shardId + 1}`);
        this.metrics.shardConnects += 1;
    }

    private onShardResume(shardId: number) {
        this.logger.error('Connection resumed...', `SHARD ${shardId + 1}`);
        this.metrics.shardResumes += 1;
    }

    private onShardDisconnect(err: CloseEvent, shardId: number) {
        this.logger.error(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
        this.metrics.shardDisconnects += 1;
    }

    private onWarn(warn: string) {
        this.logger.error(warn, '', 'DISCORD WARNING');
        this.metrics.wsWarnings += 1;
    }

    private onError(error: Error) {
        this.logger.error(error, '', 'DISCORD ERROR');
        this.metrics.wsErrors += 1;
    }

    private onRatelimit() {
        this.metrics.ratelimits += 1;
    }

    private onGuildUnavailable(guild: Guild) {
        this.logger.verbose(`${guild.name ?? guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
    }
}
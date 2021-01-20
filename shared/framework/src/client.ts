import { Client, CloseEvent, Guild } from 'discord.js';
import { Logger } from '@miko/logger';
import { IMikoMetrics, MikoClientOptions } from './types';
import { metaStorage } from './common';

export class MiClient extends Client {
    protected logger = new Logger('CLIENT');

    public metrics: IMikoMetrics = {
        ratelimits: 0,
        shardConnects: 0,
        shardDisconnects: 0,
        shardResumes: 0,
        wsErrors: 0,
        wsWarnings: 0
    };

    public constructor(opts: MikoClientOptions = {}) {
        super(opts);

        this.logger.log('Added client instance...', 'META');
        metaStorage.client = this;
    }

    public async login(token?: string): Promise<string> {
        this.logger.log('Setting up events...');
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

        this.logger.log('Connecting to Discord...');
        return super.login(token);
    }

    private async onClientReady() {
        this.metrics.startedAt = new Date();
        this.logger.log(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
    }

    private onShardReady(shardId: number) {
        this.logger.log('Ready to work!', `SHARD ${shardId + 1}`);
    }

    private onShardReconnecting(shardId: number) {
        this.logger.log('Connected to Discord!', `SHARD ${shardId + 1}`);
        this.metrics.shardConnects += 1;
    }

    private onShardResume(shardId: number) {
        this.logger.verbose('Connection resumed...', `SHARD ${shardId + 1}`);
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
        this.logger.log(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
    }
}
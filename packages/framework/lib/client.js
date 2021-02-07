"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiClient = void 0;
const discord_js_1 = require("discord.js");
const logger_1 = require("@miko/logger");
const metadata_1 = require("./metadata");
class MiClient extends discord_js_1.Client {
    constructor(...modules) {
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
        this.logger = new logger_1.Logger('CLIENT');
        this.metrics = {
            ratelimits: 0,
            shardConnects: 0,
            shardDisconnects: 0,
            shardResumes: 0,
            wsErrors: 0,
            wsWarnings: 0
        };
        metadata_1.metaStorage.addModules(this, modules);
    }
    async login(token) {
        this.logger.log('Initializing provider services');
        await metadata_1.metaStorage.init();
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
    async onClientReady() {
        this.metrics.startedAt = new Date();
        this.logger.log(`Ready to work! Serving ${this.guilds.cache.size} guilds...`);
    }
    onShardReady(shardId) {
        this.logger.log('Ready to work!', `SHARD ${shardId + 1}`);
    }
    onShardReconnecting(shardId) {
        this.logger.log('Connected to Discord!', `SHARD ${shardId + 1}`);
        this.metrics.shardConnects += 1;
    }
    onShardResume(shardId) {
        this.logger.verbose('Connection resumed...', `SHARD ${shardId + 1}`);
        this.metrics.shardResumes += 1;
    }
    onShardDisconnect(err, shardId) {
        this.logger.warn(`Disconnected by Discord: ${err}`, `SHARD ${shardId + 1}`);
        this.metrics.shardDisconnects += 1;
    }
    onWarn(warn) {
        this.logger.warn(warn, 'DISCORD WARNING');
        this.metrics.wsWarnings += 1;
    }
    onError(error) {
        this.logger.error(error, 'DISCORD ERROR');
        this.metrics.wsErrors += 1;
    }
    onRatelimit() {
        this.metrics.ratelimits += 1;
    }
    onGuildUnavailable(guild) {
        this.logger.log(`${guild.name || guild.id} is currently dead...`, 'GUILD_UNAVAILABLE');
    }
}
exports.MiClient = MiClient;
//# sourceMappingURL=client.js.map
import { ShardingManager } from 'discord.js';
import { Logger } from 'tslog';

const logger = new Logger({ name: 'ShardingManager' });

const shards = new ShardingManager('./lib/main.js', {
	token: process.env.SHARDS_TOKEN,
	totalShards: Number(process.env.SHARDS_COUNT) || 'auto'
});

shards.spawn().catch(err => logger.error(`Shard failed to spawn, ${err}`));

shards.on('shardCreate', shard => logger.debug(`Shard #${shard.id} created!`));

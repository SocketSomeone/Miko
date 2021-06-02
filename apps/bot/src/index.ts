import { ShardingManager } from 'discord.js';
import { Logger } from 'tslog';
import { config } from '@miko/config';

const logger = new Logger({ name: 'ShardingManager' });

const shards = new ShardingManager('./lib/main.js', {
	token: config.bot.TOKEN,
	totalShards: 5
});

shards.on('shardCreate', shard => logger.debug(`Shard #${shard.id} created!`));

shards.spawn().catch(err => logger.error(`Shard failed to spawn, ${err}`));

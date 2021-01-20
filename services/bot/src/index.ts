import dotenv from 'dotenv';
import { Logger } from '@miko/logger';
import { MiClient } from '@miko/framework';
import { createDatabase } from '@miko/database';
import { join } from 'path';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: join(__dirname, '../../../.docker/.env-develop')
    });
}

const logger = new Logger('ROOT');

const main = async () => {
    logger.log('Starting Miko instance!');
    const client = new MiClient({
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

    logger.log('Connection to Database...');
    await createDatabase();

    logger.log('Initializing BOT login...');
    await client.login(process.env.TOKEN);
};

main().catch((err) => logger.error(err));
import dotenv from 'dotenv';
import { join } from 'path';

import { Logger } from '@miko/logger';
import { MiClient } from '@miko/framework';
import { createDatabase } from '@miko/database';

import * as modules from './modules';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config({
        path: join(__dirname, '../../../.docker/.env-develop')
    });
}

const logger = new Logger('ROOT');

const main = async () => {
    logger.log('Starting Miko instance!');
    const client = new MiClient(modules);

    logger.log('Connection to Database...');
    await createDatabase();

    logger.log('Initializing BOT login...');
    await client.login(process.env.TOKEN);
};

main().catch((err) => logger.error(err));
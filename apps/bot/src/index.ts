import { Logger } from '@miko/logger';
import { MiClient } from '@miko/framework';
import { createConnection } from '@miko/database';

import * as modules from './modules';

const logger = new Logger('ROOT');

const main = async () => {
    logger.log('Starting Miko instance!!');
    const client = new MiClient(modules);

    logger.log('Connection to Database...');
    await createConnection();

    logger.log('Initializing BOT login...');
    await client.login(process.env.TOKEN);
};

main().catch((err) => logger.error(err));

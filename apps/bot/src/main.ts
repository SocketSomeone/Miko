import { Logger } from 'tslog';
import { MiClient } from '@miko/common';
import { createConnection } from '@miko/database';
import { container } from 'tsyringe';

const logger = new Logger({ name: 'ROOT' });

const main = async () => {
	logger.debug('Starting Miko instance!');
	const client = container.resolve(MiClient);

	logger.debug('Connection to Database...');
	await createConnection(String(process.env.NODE_ENV));

	logger.debug('Loading modules');
	await import('./modules');

	logger.debug('Initializing BOT login...');
	await client.login(process.env.TOKEN);
};

main().catch(err => logger.error(err));

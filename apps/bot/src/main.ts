
import { createConnection } from '@miko/database';
import { Client } from '@miko/common';
import { Logger } from 'tslog';
import { container } from 'tsyringe';

const logger = new Logger({ name: 'ROOT' });

const modules = ['./information'];

async function main() {
	logger.debug('Starting Miko instance!');
	const client = container.resolve(Client);

	logger.debug('Connection to Database...');
	await createConnection(String(process.env.NODE_ENV));

	logger.debug('Loading modules');
	await Promise.all(modules.map(path => import(path)));

	logger.debug('Initializing BOT login...');
	await client.login(process.env.SHARDS_TOKEN);
}

main().catch(err => logger.error(err));

import chalk from 'chalk';

import { BaseClient } from './Client';
import { createConnection, ConnectionOptions } from 'typeorm';

const rawParams = process.argv.slice(2);

const args = rawParams.filter((a) => !a.startsWith('--'));
const flags = rawParams.filter((f) => f.startsWith('--'));

process.on('unhandledRejection', (reason: any, p: any) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const main = async () => {
	const client = new BaseClient(args[0]);

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Connection to Database...'));
	console.log(chalk.green('-------------------------------------'));

	await createConnection();

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Starting bot...'));
	console.log(chalk.green('-------------------------------------'));
	await client.init();

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Connecting to discord...'));
	console.log(chalk.green('-------------------------------------'));
	await client.connect();
};

main().catch((err) => console.error(err));

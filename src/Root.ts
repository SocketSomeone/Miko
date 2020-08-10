import chalk from 'chalk';

import { BaseClient } from './Client';
import { createConnection } from 'typeorm';

import { configureScope, init } from '@sentry/node';

const pkg = require('../package.json');
const config = require('../config.json');

const rawParams = process.argv.slice(2);

const args = rawParams.filter((a) => !a.startsWith('--'));
const flags = rawParams.filter((a) => a.startsWith('--'));

const runEnv = args[0];
const token = args[1];
const shardId = Number(args[2]);
const shardCount = Number(args[3]);

init({
	dsn: config.sentryDsn,
	release: pkg.version,
	environment: runEnv
});

configureScope((scope) => {
	scope.setTag('instance', 'Miko');
	scope.setTag('shard', `${shardId} / ${shardCount}`);
});

process.on('uncaughtException', (reason: any, p: any) => {
	console.error('Uncaught Exception at: Promise', p, 'reason:', reason);
});

process.on('unhandledRejection', (reason: any, p: any) => {
	console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const main = async () => {
	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green(`This is shard ${chalk.blue(`${shardId}/${shardCount}`)} of instance ${chalk.blue('Miko')}`));
	console.log(chalk.green('-------------------------------------'));

	const client = new BaseClient({
		token,
		shardId,
		shardCount,
		config: { ...config, runEnv },
		flags
	});

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Connection to Database...'));
	console.log(chalk.green('-------------------------------------'));

	await createConnection();

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Starting bot...'));
	console.log(chalk.green('-------------------------------------'));
	await client.init();

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Waiting for start ticket...'));
	console.log(chalk.green('-------------------------------------'));

	await client.waitForStartupTicket();

	console.log(chalk.green('-------------------------------------'));
	console.log(chalk.green('Connecting to discord...'));
	console.log(chalk.green('-------------------------------------'));
	await client.connect();
};

main().catch((err) => console.error(err));

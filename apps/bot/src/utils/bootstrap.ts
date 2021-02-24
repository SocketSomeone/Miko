import { MiClient } from '@miko/common';
import { createConnection } from '@miko/database';
import { Logger } from 'tslog';
import { container } from 'tsyringe';

export class BootstrapService {
	public static logger = new Logger({ name: 'BOOTSTRAP' });

	public static requiredPaths = ['../modules'];

	public static async startMiko(): Promise<void> {
		this.logger.debug('Starting Miko instance!');
		const client = container.resolve(MiClient);

		this.logger.debug('Connection to Database...');
		await createConnection(String(process.env.NODE_ENV));

		this.logger.debug('Loading modules');
		await Promise.all(this.requiredPaths.map(path => import(path)));

		this.logger.debug('Initializing BOT login...');
		await client.login(process.env.SHARDS_TOKEN);
	}
}

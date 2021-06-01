import { init, Integrations } from '@sentry/node';
import { join } from 'path';
import { Logger } from 'tslog';
import { injectable } from 'tsyringe';
import { config } from '@miko/config';
import { readFileSync } from 'fs';
import { PostConstruct } from '../decorators';

@injectable()
export class EmergencyService {
	private logger = new Logger({ name: this.constructor.name });

	@PostConstruct
	public async init(): Promise<void> {
		const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));

		init({
			dsn: config.SENTRY_DSN,
			release: `${pkg.name}@${pkg.version}`,
			environment: config.env,
			debug: config.isDev,
			integrations: [
				new Integrations.Http({ tracing: true }),
				new Integrations.OnUnhandledRejection(),
				new Integrations.OnUncaughtException()
			],
			tracesSampleRate: 1.0
		});

		process.on('unhandledRejection', err => this.logger.fatal(err));
		process.on('uncaughtException', err => this.logger.fatal(err));
	}
}

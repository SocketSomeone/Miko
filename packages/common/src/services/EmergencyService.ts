import type { Scope } from '@sentry/node';
import { captureException, init, Integrations, withScope } from '@sentry/node';
import { config } from '@miko/config';
import { Logger } from 'tslog';
import { injectable } from 'tsyringe';
import { PostConstruct } from '../decorators';

@injectable()
export class EmergencyService {
	private logger = new Logger({ name: this.constructor.name });

	@PostConstruct
	public async init(): Promise<void> {
		init({
			dsn: config.SENTRY_DSN,
			release: `miko@${config.instanceName}`,
			environment: config.env,
			debug: config.isDev,
			maxBreadcrumbs: 50,
			integrations: [
				new Integrations.Http({ tracing: true, breadcrumbs: true }),
				new Integrations.FunctionToString(),
				new Integrations.LinkedErrors(),
				new Integrations.Console(),
				new Integrations.Modules(),
				new Integrations.OnUnhandledRejection(),
				new Integrations.OnUncaughtException()
			],
			tracesSampleRate: 1.0
		});

		process.on('unhandledRejection', err => this.logger.fatal(err));
		process.on('uncaughtException', err => this.logger.fatal(err));
	}

	public debug(...args: unknown[]): void {
		this.logger.trace(args);
	}

	public info(...args: unknown[]): void {
		this.logger.info(args);
	}

	public warn(...args: unknown[]): void {
		this.logger.warn(args);
	}

	public error(err: Error, func: (scope: Scope) => void = () => null): void {
		this.logger.error(err);

		withScope(scope => {
			func(scope);

			captureException(err);
		});
	}
}

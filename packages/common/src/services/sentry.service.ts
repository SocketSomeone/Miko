import { init, Integrations, captureMessage, Severity } from '@sentry/node';
import type { OnModuleInit } from '@nestjs/common';
import { Logger, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService extends Logger implements OnModuleInit {
	public constructor(private configService: ConfigService) {
		super('SENTRY');
	}

	public async onModuleInit(): Promise<void> {
		const pkg = JSON.parse(readFileSync(join(process.cwd(), './package.json'), 'utf-8'));
		const isDev = this.configService.get<string>('NODE_ENV') !== 'production';

		init({
			dsn: this.configService.get<string>('SENTRY_DSN'),
			release: pkg.version,
			environment: isDev ? 'development' : 'production',
			debug: isDev,
			initialScope: scope => {
				scope.setTag('instance', pkg.name);

				return scope;
			},
			maxBreadcrumbs: 50,
			integrations: [
				new Integrations.Http({ tracing: true, breadcrumbs: true }),
				new Integrations.FunctionToString(),
				new Integrations.LinkedErrors(),
				new Integrations.Console(),
				new Integrations.Modules(),
				new Integrations.OnUncaughtException(),
				new Integrations.OnUnhandledRejection(),
				new Integrations.InboundFilters()
			],
			tracesSampleRate: 1.0
		});
	}

	public log(message: string, context?: string): void {
		try {
			captureMessage(message, Severity.Log);
			super.log(message, context);
		} catch (err) {
			// NO-OP
		}
	}

	public error(message: string, trace?: string, context?: string): void {
		try {
			captureMessage(message, Severity.Error);
			super.error(message, trace, context);
		} catch (err) {
			// NO-OP
		}
	}

	public warn(message: string, context?: string): void {
		try {
			captureMessage(message, Severity.Warning);
			super.warn(message, context);
		} catch (err) {
			// NO-OP
		}
	}

	public debug(message: string, context?: string): void {
		try {
			captureMessage(message, Severity.Debug);
			super.debug(message, context);
		} catch (err) {
			// NO-OP
		}
	}

	public verbose(message: string, context?: string): void {
		try {
			captureMessage(message, Severity.Info);
			super.verbose(message, context);
		} catch (err) {
			// NO-OP
		}
	}
}

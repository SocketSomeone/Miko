import { createConnection } from '@miko/database';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Logger } from 'tslog';

import helmet from 'fastify-helmet';
import compression from 'fastify-compress';
import fastifyCookie from 'fastify-cookie';
import fastifyCsrf from 'fastify-csrf';

import { AppModule } from './app.module';

const logger = new Logger({ name: 'BOOTSTRAP' });

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger: true,
			ignoreTrailingSlash: true
		})
	);

	await Promise.all([
		createConnection(String(process.env.NODE_ENV)).catch(err => logger.error(err)),
		app.register(helmet),
		app.register(compression),
		app.register(fastifyCookie),
		app.register(fastifyCsrf)
	]);

	app.setGlobalPrefix('/api');
	app.enableCors({ origin: true, credentials: true });
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	await app.listen(8888);
}

bootstrap().catch(err => logger.error(err));

import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import helmet from 'fastify-helmet';
import compression from 'fastify-compress';
import fastifyCookie from 'fastify-cookie';
import fastifyCsrf from 'fastify-csrf';

import { AppModule } from './app.module';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter({
			logger: true,
			ignoreTrailingSlash: true
		})
	);

	await Promise.all([
		app.register(helmet),
		app.register(compression),
		app.register(fastifyCookie),
		app.register(fastifyCsrf)
	]);

	const config = new DocumentBuilder()
		.setTitle('Miko API')
		.setDescription('Miko API description')
		.setVersion('1.0')
		.addTag('Miko')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	app.setGlobalPrefix('/api');
	app.enableCors({ origin: true, credentials: true });
	app.useGlobalPipes(new ValidationPipe({ transform: true }));
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

	await app.listen(4000, '0.0.0.0');
}

bootstrap();

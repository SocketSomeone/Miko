import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function run() {
	await NestFactory.createApplicationContext(AppModule);
}

run();

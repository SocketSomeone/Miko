import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { ClusterService } from './cluster.service';

import middie from 'middie';
import helmet from 'fastify-helmet';

import * as cookie from 'cookie-parser';
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
      ignoreTrailingSlash: true,
    }),
  );

  await Promise.all([
    app.register(middie),
    app.register(helmet),
    app.use(cookie()),
    app.use(csurf()),
  ]);

  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}

ClusterService.clusterize(bootstrap);

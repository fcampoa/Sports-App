import { Controller, Get } from '@nestjs/common';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Writable } from 'node:stream';
import pino from 'pino';
import { AppModule } from '../../src/app.module.js';
import {
  READINESS_CHECK,
  type ReadinessCheck,
} from '../../src/application/ports/readiness-check.js';
import type { AppConfig } from '../../src/infrastructure/config/app-config.js';

export const TEST_CONFIG: AppConfig = {
  databaseUrl: 'postgres://u:p@127.0.0.1:1/db',
  logLevel: 'info',
  port: 0,
};

/** Controlador solo para pruebas: provoca un error inesperado con un mensaje secreto. */
@Controller('__test')
export class ExplodingController {
  @Get('boom')
  boom(): never {
    throw new Error('SECRET-INTERNAL-DETAIL');
  }
}

export interface TestApp {
  readonly app: NestFastifyApplication;
  /** Lineas de log (objetos JSON) emitidas por la app. */
  readonly logs: Record<string, unknown>[];
}

export async function createTestApp(options: {
  readiness?: ReadinessCheck;
  databaseUrl?: string;
  withExplodingController?: boolean;
}): Promise<TestApp> {
  const logs: Record<string, unknown>[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback): void {
      const parsed: unknown = JSON.parse(chunk.toString('utf8'));
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        logs.push(Object.fromEntries(Object.entries(parsed)));
      }
      callback();
    },
  });
  const logger = pino({ level: 'info' }, stream);

  let builder = Test.createTestingModule({
    imports: [
      AppModule.register({
        config: { ...TEST_CONFIG, databaseUrl: options.databaseUrl ?? TEST_CONFIG.databaseUrl },
        logger,
      }),
    ],
    controllers: options.withExplodingController === true ? [ExplodingController] : [],
  });
  if (options.readiness !== undefined) {
    builder = builder.overrideProvider(READINESS_CHECK).useValue(options.readiness);
  }
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter({ loggerInstance: logger }),
  );
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return { app, logs };
}

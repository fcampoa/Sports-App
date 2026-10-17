import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import pino from 'pino';
import { stringify } from 'yaml';
import { AppModule } from '../app.module.js';

/**
 * Genera el documento OpenAPI 3.1 desde la app, sin conectar a la base de datos
 * (el pool de pg conecta de forma perezosa) y sin emitir logs.
 */
export async function buildOpenApiDocument(): Promise<OpenAPIObject> {
  const logger = pino({ level: 'silent' });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register({
      config: {
        databaseUrl: 'postgres://openapi:openapi@127.0.0.1:1/openapi',
        logLevel: 'silent',
        port: 3000,
      },
      logger,
    }),
    new FastifyAdapter(),
    { logger: false },
  );
  try {
    await app.init();
    const config = new DocumentBuilder()
      .setTitle('Baseball service')
      .setDescription('Estadisticas de beisbol (Sports-App).')
      .setVersion('0.1.0')
      .setOpenAPIVersion('3.1.0')
      .build();
    return SwaggerModule.createDocument(app, config);
  } finally {
    await app.close();
  }
}

export function toYaml(document: OpenAPIObject): string {
  return stringify(JSON.parse(JSON.stringify(document)));
}

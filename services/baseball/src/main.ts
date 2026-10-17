import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module.js';
import { ConfigError, loadConfig, type AppConfig } from './infrastructure/config/app-config.js';
import { createLogger, PinoLoggerService } from './infrastructure/logging/logger.js';

function loadDotEnvIfPresent(): void {
  try {
    process.loadEnvFile();
  } catch (error) {
    const missing = error instanceof Error && 'code' in error && error.code === 'ENOENT';
    if (!missing) {
      throw error;
    }
  }
}

async function main(): Promise<void> {
  // El logger JSON existe antes que cualquier otra cosa: ni siquiera la config puede loguear en texto.
  const bootstrapLogger = createLogger('info');

  let config: AppConfig;
  try {
    loadDotEnvIfPresent();
    config = loadConfig(process.env);
  } catch (error) {
    bootstrapLogger.fatal(
      error instanceof ConfigError ? error.message : 'Cannot load configuration',
    );
    process.exit(1);
  }

  const logger = createLogger(config.logLevel);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register({ config, logger }),
    new FastifyAdapter({ loggerInstance: logger }),
    { logger: new PinoLoggerService(logger) },
  );
  app.enableShutdownHooks();
  await app.listen(config.port, '0.0.0.0');
}

main().catch((error: unknown) => {
  createLogger('info').fatal({ err: error }, 'Service failed to start');
  process.exit(1);
});

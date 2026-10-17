import { Global, Module, type DynamicModule } from '@nestjs/common';
import type { Logger } from 'pino';
import { READINESS_CHECK } from '../application/ports/readiness-check.js';
import type { AppConfig } from './config/app-config.js';
import { Database } from './db/database.js';
import { PgReadinessCheck } from './db/pg-readiness-check.js';
import { APP_LOGGER } from './logging/logger.js';

export const APP_CONFIG = Symbol('APP_CONFIG');

export interface InfrastructureOptions {
  readonly config: AppConfig;
  readonly logger: Logger;
}

@Global()
@Module({})
export class InfrastructureModule {
  static register(options: InfrastructureOptions): DynamicModule {
    return {
      module: InfrastructureModule,
      providers: [
        { provide: APP_CONFIG, useValue: options.config },
        { provide: APP_LOGGER, useValue: options.logger },
        {
          provide: Database,
          useFactory: (): Database => new Database(options.config.databaseUrl, options.logger),
        },
        {
          provide: READINESS_CHECK,
          useFactory: (database: Database): PgReadinessCheck => new PgReadinessCheck(database),
          inject: [Database],
        },
      ],
      exports: [APP_CONFIG, APP_LOGGER, Database, READINESS_CHECK],
    };
  }
}

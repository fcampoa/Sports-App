import type { OnModuleDestroy } from '@nestjs/common';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { Logger } from 'pino';
import * as schema from './schema.js';

const CONNECTION_TIMEOUT_MS = 2_000;
const QUERY_TIMEOUT_MS = 2_000;

/** Conexion a PostgreSQL (pool de pg + cliente Drizzle). El pool conecta de forma perezosa. */
export class Database implements OnModuleDestroy {
  readonly pool: Pool;
  readonly orm: NodePgDatabase<typeof schema>;

  constructor(databaseUrl: string, logger: Logger) {
    this.pool = new Pool({
      connectionString: databaseUrl,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
      query_timeout: QUERY_TIMEOUT_MS,
      statement_timeout: QUERY_TIMEOUT_MS,
    });
    // Sin este manejador, un error en un cliente inactivo tumba el proceso.
    this.pool.on('error', (err) => {
      logger.error({ err }, 'Unexpected error on idle PostgreSQL client');
    });
    this.orm = drizzle(this.pool, { schema });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}

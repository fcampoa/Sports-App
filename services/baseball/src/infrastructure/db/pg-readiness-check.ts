import { sql } from 'drizzle-orm';
import type { ReadinessCheck } from '../../application/ports/readiness-check.js';
import type { Database } from './database.js';

export class PgReadinessCheck implements ReadinessCheck {
  constructor(private readonly database: Database) {}

  async check(): Promise<void> {
    await this.database.orm.execute(sql`select 1`);
  }
}

import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execFile } from 'node:child_process';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { Pool } from 'pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../support/app.js';

const run = promisify(execFile);
const PROJECT_DIR = join(import.meta.dirname, '..', '..');
const DRIZZLE_KIT = join(PROJECT_DIR, 'node_modules', 'drizzle-kit', 'bin.cjs');

describe('Integracion con PostgreSQL real (Testcontainers)', () => {
  let container: StartedPostgreSqlContainer | undefined;
  let testApp: TestApp | undefined;

  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine').start();
  });

  afterAll(async () => {
    await testApp?.app.close();
    await container?.stop();
  });

  it('db:migrate (drizzle-kit migrate) aplica la migracion inicial vacia', async () => {
    if (container === undefined) {
      throw new Error('container not started');
    }
    const url = container.getConnectionUri();
    const result = await run(process.execPath, [DRIZZLE_KIT, 'migrate'], {
      cwd: PROJECT_DIR,
      env: { ...process.env, DATABASE_URL: url },
    });
    expect(result.stderr).not.toMatch(/error/i);

    const pool = new Pool({ connectionString: url });
    try {
      const applied = await pool.query<{ count: string }>(
        'select count(*)::text as count from drizzle.__drizzle_migrations',
      );
      expect(applied.rows[0]?.count).toBe('1');
    } finally {
      await pool.end();
    }
  });

  it('GET /ready responde 200 con la base migrada', async () => {
    if (container === undefined) {
      throw new Error('container not started');
    }
    testApp = await createTestApp({ databaseUrl: container.getConnectionUri() });
    const response = await testApp.app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ status: 'ready' });
  });

  it('GET /ready responde 503 problem+json en menos de 5 s al detener la base', async () => {
    if (container === undefined || testApp === undefined) {
      throw new Error('previous steps did not run');
    }
    await container.stop();
    const started = Date.now();
    const response = await testApp.app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(503);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(Date.now() - started).toBeLessThan(5_000);
  });
});

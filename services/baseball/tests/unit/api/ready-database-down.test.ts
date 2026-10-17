import { afterEach, describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../support/app.js';

describe('GET /ready con PostgreSQL caido (conexion real rechazada)', () => {
  let current: TestApp | undefined;

  afterEach(async () => {
    await current?.app.close();
    current = undefined;
  });

  it('responde 503 application/problem+json en menos de 5 s', async () => {
    // Puerto 1 en loopback: nadie escucha, la conexion es rechazada.
    current = await createTestApp({ databaseUrl: 'postgres://u:p@127.0.0.1:1/db' });
    const started = Date.now();
    const response = await current.app.inject({ method: 'GET', url: '/ready' });
    const elapsedMs = Date.now() - started;
    expect(response.statusCode).toBe(503);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(elapsedMs).toBeLessThan(5_000);
  });
});

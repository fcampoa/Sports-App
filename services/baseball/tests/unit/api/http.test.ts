import { afterEach, describe, expect, it } from 'vitest';
import type { ReadinessCheck } from '../../../src/application/ports/readiness-check.js';
import { createTestApp, type TestApp } from '../../support/app.js';

const PROBLEM = 'application/problem+json';

function parseBody(payload: string): unknown {
  const parsed: unknown = JSON.parse(payload);
  return parsed;
}

describe('API HTTP', () => {
  let current: TestApp | undefined;

  afterEach(async () => {
    await current?.app.close();
    current = undefined;
  });

  const okReadiness: ReadinessCheck = { check: () => Promise.resolve() };
  const failingReadiness: ReadinessCheck = {
    check: () => Promise.reject(new Error('connect ECONNREFUSED secret-host:5432')),
  };

  it('GET /health responde 200 con status ok sin tocar la base de datos', async () => {
    let calls = 0;
    current = await createTestApp({
      readiness: {
        check: () => {
          calls += 1;
          return Promise.resolve();
        },
      },
    });
    const response = await current.app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.payload)).toEqual({ status: 'ok' });
    expect(calls).toBe(0);
  });

  it('GET /ready responde 200 cuando la base de datos esta disponible', async () => {
    current = await createTestApp({ readiness: okReadiness });
    const response = await current.app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(200);
    expect(parseBody(response.payload)).toEqual({ status: 'ready' });
  });

  it('GET /ready responde 503 application/problem+json si la base de datos esta caida', async () => {
    current = await createTestApp({ readiness: failingReadiness });
    const response = await current.app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(503);
    expect(response.headers['content-type']).toContain(PROBLEM);
    expect(parseBody(response.payload)).toMatchObject({ type: 'about:blank', status: 503 });
    expect(response.payload).not.toContain('ECONNREFUSED');
    expect(response.payload).not.toContain('secret-host');
  });

  it('una ruta inexistente responde 404 application/problem+json', async () => {
    current = await createTestApp({ readiness: okReadiness });
    const response = await current.app.inject({ method: 'GET', url: '/no-existe' });
    expect(response.statusCode).toBe(404);
    expect(response.headers['content-type']).toContain(PROBLEM);
    expect(parseBody(response.payload)).toMatchObject({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  it('un JSON mal formado responde 400 application/problem+json', async () => {
    current = await createTestApp({ readiness: okReadiness });
    const response = await current.app.inject({
      method: 'POST',
      url: '/health',
      headers: { 'content-type': 'application/json' },
      payload: '{no-json',
    });
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toContain(PROBLEM);
  });

  it('un error inesperado responde 500 problem+json sin mensaje ni traza y queda en los logs', async () => {
    current = await createTestApp({ readiness: okReadiness, withExplodingController: true });
    const response = await current.app.inject({ method: 'GET', url: '/__test/boom' });
    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toContain(PROBLEM);
    expect(parseBody(response.payload)).toMatchObject({ type: 'about:blank', status: 500 });
    expect(response.payload).not.toContain('SECRET-INTERNAL-DETAIL');
    expect(response.payload).not.toContain('stack');
    expect(JSON.stringify(current.logs)).toContain('SECRET-INTERNAL-DETAIL');
  });

  it('los logs de la app son objetos JSON con nivel y hora', async () => {
    current = await createTestApp({ readiness: okReadiness });
    await current.app.inject({ method: 'GET', url: '/health' });
    expect(current.logs.length).toBeGreaterThan(0);
    for (const line of current.logs) {
      expect(line).toHaveProperty('level');
      expect(line).toHaveProperty('time');
    }
  });
});

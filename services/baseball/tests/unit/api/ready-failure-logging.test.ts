import { afterEach, describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../support/app.js';

describe('GET /ready: causa del fallo (ADR-0002 §3, RFC 9457)', () => {
  let current: TestApp | undefined;

  afterEach(async () => {
    await current?.app.close();
    current = undefined;
  });

  async function failingReady(): Promise<{
    body: string;
    logs: Record<string, unknown>[];
  }> {
    const cause = Object.assign(new Error('connect ECONNREFUSED 10.9.8.7:5432'), {
      code: 'ECONNREFUSED',
    });
    current = await createTestApp({
      readiness: {
        check: () => Promise.reject(cause),
      },
    });
    const response = await current.app.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(503);
    return { body: response.body, logs: current.logs };
  }

  it('el cuerpo del 503 no filtra la causa interna', async () => {
    const { body } = await failingReady();
    expect(body).not.toContain('ECONNREFUSED');
    expect(body).not.toContain('10.9.8.7');
    expect(JSON.parse(body)).toEqual({
      type: 'about:blank',
      title: 'Service Unavailable',
      status: 503,
      detail: 'The service is not ready to receive traffic.',
    });
  });

  it('registra el 503 en nivel warn con la causa real y sin traza', async () => {
    const { logs } = await failingReady();
    const entry = logs.find((line) => line.msg === 'Request failed');
    expect(entry).toBeDefined();
    expect(entry?.level).toBe(40); // warn
    expect(JSON.stringify(entry)).toContain('ECONNREFUSED');
    expect(JSON.stringify(entry)).not.toContain('stack');
    expect(logs.filter((line) => line.level === 50)).toEqual([]);
  });
});

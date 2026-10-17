import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { buildOpenApiDocument } from '../../../src/openapi/openapi.js';

const OPENAPI_PATH = join(import.meta.dirname, '..', '..', '..', 'openapi.yaml');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

describe('Contrato OpenAPI (ADR-0002 3)', () => {
  it('openapi.yaml coincide con el documento generado por la app', async () => {
    const generated: unknown = JSON.parse(JSON.stringify(await buildOpenApiDocument()));
    const committed: unknown = parse(readFileSync(OPENAPI_PATH, 'utf8'));
    expect(committed).toEqual(generated);
  });

  it('declara OpenAPI 3.1', async () => {
    const document = await buildOpenApiDocument();
    expect(document.openapi).toMatch(/^3\.1\.\d+$/);
    const committed: unknown = parse(readFileSync(OPENAPI_PATH, 'utf8'));
    expect(isRecord(committed) ? committed.openapi : undefined).toMatch(/^3\.1\.\d+$/);
  });

  it('documenta /health y /ready', async () => {
    const document = await buildOpenApiDocument();
    expect(Object.keys(document.paths)).toEqual(expect.arrayContaining(['/health', '/ready']));
  });

  it('las respuestas de error se documentan solo como application/problem+json', async () => {
    const document = await buildOpenApiDocument();
    let errorResponses = 0;
    for (const pathItem of Object.values(document.paths)) {
      for (const operation of Object.values(pathItem)) {
        if (!isRecord(operation) || !isRecord(operation.responses)) {
          continue;
        }
        for (const [status, response] of Object.entries(operation.responses)) {
          if (Number(status) < 400 || !isRecord(response)) {
            continue;
          }
          errorResponses += 1;
          const content = response.content;
          expect(isRecord(content) ? Object.keys(content) : []).toEqual([
            'application/problem+json',
          ]);
        }
      }
    }
    expect(errorResponses).toBeGreaterThan(0);
  });

  it('no usa oneOf junto a nullable (issue nestjs/swagger #3928)', async () => {
    const text = JSON.stringify(await buildOpenApiDocument());
    expect(text).not.toContain('"nullable"');
  });
});

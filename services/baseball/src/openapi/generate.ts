import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOpenApiDocument, toYaml } from './openapi.js';

const target = resolve(process.cwd(), 'openapi.yaml');
const document = await buildOpenApiDocument();
writeFileSync(target, toYaml(document), 'utf8');
process.stdout.write(`openapi.yaml written (OpenAPI ${document.openapi})\n`);

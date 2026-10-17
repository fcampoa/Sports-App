import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ALLOWED_BARE_SPECIFIERS,
  TYPESCRIPT_EXTENSIONS,
  domainViolations,
  moduleSpecifiers,
} from '../../support/architecture.js';

const SRC_DIR = join(import.meta.dirname, '..', '..', '..', 'src');
const DOMAIN_DIR = join(SRC_DIR, 'domain');
const NOT_ALLOWED = 'especificador no permitido en el dominio';

function listTypeScriptFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      return listTypeScriptFiles(full);
    }
    return TYPESCRIPT_EXTENSIONS.some((ext) => entry.name.endsWith(ext)) ? [full] : [];
  });
}

describe('Arquitectura: frontera del dominio (ADR-BB-0003, regla 5 de CLAUDE.md)', () => {
  const files = listTypeScriptFiles(DOMAIN_DIR);

  it('ADR-BB-0003: el dominio contiene al menos un archivo que analizar', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files.map((file) => [relative(SRC_DIR, file).split(sep).join('/'), file] as const))(
    'ADR-BB-0003: %s no importa framework, ORM, I/O ni otras capas',
    (name, file) => {
      const relativeDir = name.split('/').slice(0, -1).join('/');
      expect(domainViolations(readFileSync(file, 'utf8'), relativeDir, name)).toEqual([]);
    },
  );

  describe('el detector funciona (autoprueba)', () => {
    it('ADR-BB-0003: hoy no hay especificadores bare permitidos', () => {
      expect(ALLOWED_BARE_SPECIFIERS).toEqual([]);
    });

    it('ADR-BB-0003: las extensiones analizadas son .ts, .mts, .cts y .tsx', () => {
      expect(TYPESCRIPT_EXTENSIONS).toEqual(['.ts', '.mts', '.cts', '.tsx']);
    });

    it.each([
      ["import { Injectable } from '@nestjs/common';", '@nestjs/common'],
      ["import { drizzle } from 'drizzle-orm/node-postgres';", 'drizzle-orm/node-postgres'],
      ["import pg from 'pg';", 'pg'],
      ["import Fastify from 'fastify';", 'fastify'],
      ["import { z } from 'zod';", 'zod'],
      ["import { IsInt } from 'class-validator';", 'class-validator'],
      ["export { z } from 'zod';", 'zod'],
      ["export * from '@nestjs/common';", '@nestjs/common'],
      ["const m = await import('pg');", 'pg'],
      ["import type { Pool } from 'pg';", 'pg'],
      ["const m = require('pg');", 'pg'],
      ["import pg = require('pg');", 'pg'],
      ["export type T = import('@nestjs/common').Type;", '@nestjs/common'],
      ["let x: import('pg').Pool;", 'pg'],
      ['/// <reference types="@nestjs/common" />', '@nestjs/common'],
      ['/// <reference types="node" />', `node (${NOT_ALLOWED})`],
      ['/// <reference path="../api/types.d.ts" />', '../api/types.d.ts (sale de src/domain)'],
    ])('ADR-BB-0003: detecta %s', (code, expected) => {
      expect(domainViolations(code, 'domain')).toEqual([expected]);
    });

    it.each([
      'fs',
      'net',
      'http',
      'https',
      'child_process',
      'worker_threads',
      'dgram',
      'dns',
      'tls',
      'cluster',
    ])('ADR-BB-0003: prohibe el modulo de I/O %s con y sin prefijo node:', (mod) => {
      expect(domainViolations(`import x from 'node:${mod}';`, 'domain')).toEqual([`node:${mod}`]);
      expect(domainViolations(`import x from '${mod}';`, 'domain')).toEqual([mod]);
      expect(domainViolations(`import x from 'node:${mod}/sub';`, 'domain')).toEqual([
        `node:${mod}/sub`,
      ]);
    });

    it.each([
      ["import x from '@/alias/thing';", '@/alias/thing'],
      ["import x from '~/thing';", '~/thing'],
      ["import x from 'lodash';", 'lodash'],
      ["import 'node:assert';", 'node:assert'],
    ])('ADR-BB-0003: trata como violacion el especificador bare %s', (code, specifier) => {
      expect(domainViolations(code, 'domain')).toEqual([`${specifier} (${NOT_ALLOWED})`]);
    });

    it.each([
      ["import { x } from '../api/controller.js';", '../api/controller.js (sale de src/domain)'],
      ["export * from '../infrastructure/db.js';", '../infrastructure/db.js (sale de src/domain)'],
      [
        "import { y } from '../../application/use.js';",
        '../../application/use.js (sale de src/domain)',
      ],
    ])('ADR-BB-0003: detecta %s', (code, expected) => {
      expect(domainViolations(code, 'domain')).toEqual([expected]);
    });

    it('ADR-BB-0003: analiza archivos .tsx con JSX', () => {
      const code = "import x from 'react';\nexport const a = <div />;";
      expect(domainViolations(code, 'domain', 'a.tsx')).toEqual([`react (${NOT_ALLOWED})`]);
    });

    it('ADR-BB-0003: un archivo limpio no tiene violaciones', () => {
      const code = [
        "import { a } from './rate.js';",
        "import type { B } from './stats/b.js';",
        "export type C = import('./c.js').C;",
        'export const d = a;',
      ].join('\n');
      expect(domainViolations(code, 'domain')).toEqual([]);
      expect(moduleSpecifiers(code)).toEqual(['./rate.js', './stats/b.js', './c.js']);
    });
  });
});

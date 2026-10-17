import { posix } from 'node:path';
import ts from 'typescript';

const FORBIDDEN_PACKAGES: readonly string[] = [
  '@nestjs',
  '@fastify',
  'drizzle-orm',
  'drizzle-kit',
  'pg',
  'fastify',
  'zod',
  'class-validator',
  'class-transformer',
  'pino',
  'pino-http',
  'nestjs-pino',
];

/** Modulos de I/O de Node: prohibidos en el dominio, con y sin prefijo `node:`. */
const NODE_IO_MODULES: readonly string[] = [
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
];

/** Especificadores bare permitidos en el dominio (lista blanca explicita; hoy ninguno). */
export const ALLOWED_BARE_SPECIFIERS: readonly string[] = [];

/** Extensiones de codigo TypeScript que el test de arquitectura analiza en `src/domain`. */
export const TYPESCRIPT_EXTENSIONS: readonly string[] = ['.ts', '.mts', '.cts', '.tsx'];

function isForbiddenPackage(specifier: string): boolean {
  return FORBIDDEN_PACKAGES.some((pkg) => specifier === pkg || specifier.startsWith(`${pkg}/`));
}

function isNodeIoModule(specifier: string): boolean {
  const name = specifier.startsWith('node:') ? specifier.slice('node:'.length) : specifier;
  return NODE_IO_MODULES.some((mod) => name === mod || name.startsWith(`${mod}/`));
}

/**
 * Todos los especificadores de modulo de un archivo: import, export ... from, import(), require(),
 * import('x').T en posicion de tipo y directivas `/// <reference types|path />`.
 */
export function moduleSpecifiers(sourceText: string, fileName = 'file.ts'): string[] {
  const source = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true);
  const found: string[] = [];

  for (const directive of source.typeReferenceDirectives) {
    found.push(directive.fileName);
  }
  for (const directive of source.referencedFiles) {
    found.push(directive.fileName);
  }

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      found.push(node.moduleSpecifier.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      found.push(node.moduleReference.expression.text);
    } else if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteralLike(node.argument.literal)
    ) {
      found.push(node.argument.literal.text);
    } else if (ts.isCallExpression(node)) {
      const [firstArg] = node.arguments;
      const isImportCall = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequireCall = ts.isIdentifier(node.expression) && node.expression.text === 'require';
      if (
        (isImportCall || isRequireCall) &&
        firstArg !== undefined &&
        ts.isStringLiteralLike(firstArg)
      ) {
        found.push(firstArg.text);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return found;
}

/**
 * Devuelve las violaciones de frontera de un archivo del dominio.
 * `relativeDir` es el directorio del archivo relativo a `src/` (p. ej. "domain" o "domain/stats").
 */
export function domainViolations(
  sourceText: string,
  relativeDir: string,
  fileName = 'file.ts',
): string[] {
  const violations: string[] = [];
  for (const specifier of moduleSpecifiers(sourceText, fileName)) {
    if (specifier.startsWith('.')) {
      const resolved = posix.normalize(posix.join(relativeDir, specifier));
      if (resolved !== 'domain' && !resolved.startsWith('domain/')) {
        violations.push(`${specifier} (sale de src/domain)`);
      }
    } else if (isForbiddenPackage(specifier) || isNodeIoModule(specifier)) {
      violations.push(specifier);
    } else if (!ALLOWED_BARE_SPECIFIERS.includes(specifier)) {
      // Cualquier otro especificador bare (alias futuro, paquete nuevo) tambien es violacion.
      violations.push(`${specifier} (especificador no permitido en el dominio)`);
    }
  }
  return violations;
}

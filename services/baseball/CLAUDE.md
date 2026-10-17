# Servicio de béisbol — Guía para Claude

> Este archivo aplica **solo** a `services/baseball/`. El stack de aquí no se usa en otros deportes.
> Decisión: [ADR-BB-0003](../../docs/deportes/beisbol/adr/BB-0003-cambio-stack-backend.md) (reemplaza a ADR-BB-0001) · Reglas: [reglas-negocio.md](../../docs/deportes/beisbol/reglas-negocio.md) · Modelo: [modelo-dominio.md](../../docs/deportes/beisbol/modelo-dominio.md)
> **Estado**: scaffold creado con [TAREA-BB-001](../../docs/deportes/beisbol/tareas/TAREA-BB-001-scaffold-servicio.md) (NestJS 12 + Fastify, `/health`, `/ready`, OpenAPI 3.1, drizzle-kit, `InningsPitched` y `Rate`). Aún no hay entidades ni estadísticas.

## Stack

TypeScript (`strict`) · Node.js LTS (≥ 22) · NestJS (adaptador Fastify) · PostgreSQL · Drizzle ORM + drizzle-kit · Zod (configuración y validación de entrada) · pino (logs JSON) · Vitest (+ `unplugin-swc` para los decoradores de Nest) · Testcontainers · ESLint (typescript-eslint, modo estricto) · Prettier · pnpm

Sin sabermetría ni análisis avanzado por ahora: no hay proceso `worker`. Solo estadísticas oficiales (RN-BAT, RN-PIT, RN-FLD, RN-POS).

## Estructura

```
services/baseball/
  package.json  pnpm-lock.yaml  tsconfig.json  nest-cli.json
  eslint.config.mjs  vitest.config.ts  vitest.integration.config.ts
  drizzle.config.ts  .env.example
  openapi.yaml                 Contrato (el test de contrato lo compara con el generado por Nest)
  drizzle/                     Migraciones SQL (drizzle-kit)
  src/
    main.ts                    Arranque (logger pino antes que nada, config Zod, Fastify)
    app.module.ts              Raíz: ensambla los módulos
    domain/                    TypeScript puro: sin @nestjs, drizzle, zod, pg ni fastify
    application/               Casos de uso (clases planas) y puertos (interfaces)
    infrastructure/            Config, conexión a BD, repositorios Drizzle, logging
    api/                       Controladores, DTOs, filtro RFC 9457, módulos de Nest
    openapi/                   Generación del documento OpenAPI 3.1 (`generate.ts` escribe openapi.yaml)
  tests/
    unit/                      Dominio y API sin BD (espejo de src/)
    integration/               Con PostgreSQL en Testcontainers (requiere Docker)
    support/                   Utilidades de test (carga de fixtures, analizador de imports, app de test)
    fixtures/                  Golden files y casos por regla (JSON)
```

## Comandos

Requiere Node.js >= 22.12 y pnpm. Comandos verificados:

```
pnpm install
pnpm test                       # unitarios (Vitest)
pnpm test:integration           # requiere Docker corriendo (Testcontainers)
pnpm lint                       # ESLint
pnpm format:check               # Prettier
pnpm typecheck                  # tsc --noEmit
pnpm format                     # Prettier (escribe)
pnpm start:dev                  # API local con recarga (nest start --watch); lee .env si existe
pnpm build                      # nest build -> dist/
pnpm start                      # node dist/main.js
pnpm db:migrate                 # aplica migraciones (drizzle-kit migrate; usa DATABASE_URL)
pnpm db:generate                # genera una migracion desde src/infrastructure/db/schema.ts
pnpm openapi:generate           # build + escribe openapi.yaml desde la app (3.1)
```

Configuración por entorno (validada con Zod al arrancar): `DATABASE_URL` (obligatoria), `LOG_LEVEL` (por defecto `info`), `PORT` (por defecto `3000`). Ver `.env.example`.

Migración inicial vacía: `drizzle-kit generate --custom --name=init` (ya creada en `drizzle/`). `pnpm-workspace.yaml` de este directorio solo guarda `allowBuilds` de pnpm 12 (scripts de instalación permitidos: `@swc/core`, `esbuild`); no es un workspace de monorepo.

`docker compose up` y los Dockerfile pertenecen a TAREA-PL-001 (agente `devops`).

## Convenciones

- **Frontera del dominio**: `src/domain/` no importa `@nestjs/*`, `drizzle-orm`, `pg`, `fastify`, `zod` ni `class-validator`, ni nada de `api/`, `infrastructure/` o `application/`. Un test de arquitectura lo hace cumplir.
- **Nest solo en los bordes**: la inyección de dependencias y los decoradores viven en `api/` y `infrastructure/`. Los casos de uso son clases planas que se registran como _providers_ con fábricas; los puertos son interfaces con _tokens_.
- **Modelado**: clases inmutables con campos `readonly`, validación en el constructor y errores explícitos (`RangeError` para valores fuera de rango, `TypeError` para tipos incorrectos). Uniones discriminadas y `assertNever` para exhaustividad en `switch` sobre enums.
- **TypeScript estricto**: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`. Prohibido `any` y las aserciones `as` para saltarse el tipado; promesas siempre atendidas (`no-floating-promises`).
- **Números**: los conteos son `number` enteros (validar con `Number.isSafeInteger`); las tasas son `number | null` y se calculan al vuelo, `null` si el denominador es 0 (RN-GEN-002), nunca `Infinity` ni `NaN`. Redondear solo al presentar (RN-GEN-003), con aritmética entera, no con `toFixed` (que falla en casos como `1.005`).
- **Entradas lanzadas** guardadas como outs enteros (RN-GEN-004).
- **Tests**: el título cita el ID de regla, p. ej. `it('RN-BAT-006: OBP excluye los sacrificios de bola del denominador', ...)`. Los casos de las reglas salen de `tests/fixtures/*.json` (`it.each`).
- **Contrato**: OpenAPI 3.1 en `openapi.yaml` (ADR-0002 §3). Si `@nestjs/swagger` no puede emitir 3.1, detente y repórtalo: no rebajes la versión por tu cuenta.
- **Errores HTTP**: siempre `application/problem+json` (RFC 9457); nunca incluyen mensajes internos ni trazas.
- **Migraciones**: todo cambio de esquema con drizzle-kit; nunca editar la BD a mano.
- **Logs**: JSON desde el primer mensaje del proceso, incluido el arranque. `PinoLoggerService` (`infrastructure/logging`) adapta pino al `LoggerService` de Nest y Fastify recibe la misma instancia (`loggerInstance`). No se usa `nestjs-pino`: con `bufferLogs` los mensajes tempranos no se garantizan en JSON. Las líneas que imprime el CLI de Nest en `start:dev` (compilación) no son de la app.
- **ESM**: el paquete es `type: module` con `module: NodeNext`; los imports relativos llevan extensión `.js`. TypeScript fijado en `~6.0` (typescript-eslint aún no soporta TS 7).
- **OpenAPI**: `new DocumentBuilder().setOpenAPIVersion('3.1.0')`; los errores se documentan con `@ApiProblemResponse(status, descripción)` (solo `application/problem+json`). Tras cambiar un controlador o DTO, ejecuta `pnpm openapi:generate`: el test de contrato falla si `openapi.yaml` queda desactualizado.

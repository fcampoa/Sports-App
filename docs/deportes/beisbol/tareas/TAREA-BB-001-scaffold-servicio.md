# TAREA-BB-001: Scaffold del servicio de béisbol (NestJS)

- **Estado**: Hecha
- **Ámbito**: béisbol
- **Agente sugerido**: desarrollador-backend
- **Depende de**: [ADR-BB-0003](../adr/BB-0003-cambio-stack-backend.md), [ADR-0002](../../../adr/0002-stack-por-deporte.md) §3

> Esta tarea sustituye a la versión en Python, que se descartó al cambiar el stack ([ADR-BB-0003](../adr/BB-0003-cambio-stack-backend.md)). Los *fixtures* de `services/baseball/tests/fixtures/` se conservan y ya están adaptados a TypeScript.

## Contexto
`services/baseball` no tiene código. Antes de implementar estadísticas hace falta el esqueleto con el stack aceptado (NestJS + TypeScript + PostgreSQL), la estructura hexagonal y las herramientas de calidad funcionando, para que cada tarea posterior solo agregue dominio y casos de uso. Incluye dos value objects mínimos del dominio para probar la cadena completa: tests que citan reglas, TypeScript estricto y la frontera del dominio.

## Objetivo
Un servicio `services/baseball` que se instala con `pnpm install`, levanta una API NestJS con `/health` y `/ready`, y pasa tests, ESLint, Prettier y `tsc` en modo estricto.

## Reglas de negocio involucradas
- `RN-GEN-002` — denominador 0 → `null`. Casos en `tests/fixtures/rn_gen_002_rate.json`.
- `RN-GEN-004` — entradas lanzadas almacenadas como outs enteros y mostradas como `entero.resto`. Casos en `tests/fixtures/rn_gen_004_innings_pitched.json`.
- `RN-GEN-007` — las tasas solo admiten conteos finitos y ≥ 0 (validación antes del atajo de denominador 0 de RN-GEN-002; `-0` se normaliza a `0`). Casos E01-E04 y X01-X09 de `tests/fixtures/rn_gen_002_rate.json`.
- `RN-GEN-003` y `RN-GEN-001` — apoyo: los value objects no redondean y trabajan con conteos crudos.

## Criterios de aceptación

### Proyecto y herramientas
- [x] **Dado** un clon limpio del repo **cuando** se ejecuta `pnpm install` en `services/baseball` **entonces** se instalan las dependencias sin errores con Node.js ≥ 22 (declarado en `engines`).
- [x] Existe la estructura de `services/baseball/CLAUDE.md`: `src/{domain,application,infrastructure,api}/`, `drizzle/`, `tests/{unit,integration,fixtures}/`. **No** existe carpeta `analytics/` ni proceso `worker`.
- [x] `tsconfig.json` activa `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` y `noImplicitOverride`; `pnpm typecheck` pasa.
- [x] ESLint con typescript-eslint en modo estricto (con tipos) prohíbe `any` y exige `no-floating-promises`; `pnpm lint` y `pnpm format:check` pasan.
- [x] Vitest configurado para unitarios (`pnpm test`) y, aparte, para integración (`pnpm test:integration`); los decoradores de Nest funcionan en los tests (`unplugin-swc`).

### Frontera del dominio
- [x] **Dado** cualquier archivo de `src/domain/` **cuando** se ejecutan los tests **entonces** un test falla si importa `@nestjs/*`, `drizzle-orm`, `pg`, `fastify`, `zod` o `class-validator`, o si importa de `api/`, `infrastructure/` o `application/` (test de arquitectura que analiza los `import`/`export from` del código).

### Value objects de ejemplo (dominio)
API fijada: `new InningsPitched(outs)` con `outs`, `display(): string` y `asInnings(): number`; `new Rate(numerator, denominator)` con `value: number | null`.
- [x] `InningsPitched` (RN-GEN-004): **dado** `outs = 20` **entonces** `display()` devuelve `"6.2"` y `asInnings()` ≈ `6.6667`; **dado** `outs = 0` **entonces** `"0.0"`; **dado** `outs = 27` **entonces** `"9.0"`; **dado** `outs = -1` **entonces** lanza `RangeError`; **dado** `outs = 2.5` **entonces** lanza `RangeError`; **dado** `outs = "20"` **entonces** lanza `TypeError`.
- [x] `InningsPitched` también rechaza con `RangeError` `NaN`, `Infinity` y enteros por encima de `Number.MAX_SAFE_INTEGER`.
- [x] `Rate` (RN-GEN-002): **dado** `numerator = 4`, `denominator = 12` **entonces** `value` ≈ `0.3333`; **dado** `denominator = 0` **entonces** `value` es `null` (nunca `0`, `Infinity` ni `NaN`); **dado** `numerator = 0` y `denominator = 5` **entonces** `value` es `0`; **dado** `numerator = 4` y `denominator = 1` **entonces** `value` es `4` (no se acota a 1).
- [x] `Rate` valida el signo **antes** del atajo de denominador 0: `new Rate(-1, 0)` lanza `RangeError`. También lanza `RangeError` con valores negativos, `NaN` o infinitos, y `TypeError` si algún argumento no es `number`.
- [x] `-0` se normaliza a `0` y no se rechaza (RN-GEN-007): `new Rate(-0, 5).value` es `0` (`Object.is(value, 0)`), `new Rate(4, -0).value` y `new Rate(-0, -0).value` son `null`; `new InningsPitched(-0).outs` es `0` (`Object.is`) y `display()` devuelve `"0.0"`. Tests escritos a mano (casos X07-X09 y RN-GEN-004-X05 de los *fixtures*).
- [x] Una prueba parametrizada (`it.each`) ejecuta **todos** los casos de `cases`, `cases_fractional_denominator`, `error_cases` y `regression_guards` de ambos *fixtures*.
- [x] Los títulos de los tests llevan el ID de regla (ej. `RN-GEN-004: 20 outs se muestran como 6.2`).
- [x] Un test con el golden file `golden_boxscore_2012-08-15_tbr_sea_pitching.json` verifica: IP `"9.0"`, K/9 = 12, ERA = 0 (no `null`) y K/BB = `null`.

### API
- [x] **Dado** el servicio levantado **cuando** se llama `GET /health` **entonces** responde `200` con `{"status": "ok"}` sin tocar la base de datos.
- [x] **Dado** PostgreSQL disponible **cuando** se llama `GET /ready` **entonces** responde `200`; **dado** PostgreSQL caído **entonces** responde `503` con cuerpo `application/problem+json` (RFC 9457) en menos de 5 s.
- [x] **Dado** una ruta inexistente **cuando** se llama **entonces** responde `404` en formato `application/problem+json`.
- [x] **Dado** un error inesperado en un controlador **cuando** se llama **entonces** responde `500` en `application/problem+json` **sin** el mensaje ni la traza del error; el error completo queda en los logs.
- [x] La configuración (`DATABASE_URL`, `LOG_LEVEL`, `PORT`) se lee de variables de entorno y se valida con Zod al arrancar: si falta o es inválida, el proceso termina con un mensaje claro. Existe `.env.example` y no hay secretos en el repo.
- [x] Los logs se emiten en JSON (pino) **desde el primer mensaje**, incluidos los de arranque de Nest y de Fastify.
- [x] Existe `services/baseball/openapi.yaml`, declara OpenAPI 3.1, documenta las respuestas de error solo como `application/problem+json`, y un test verifica que coincide con el generado por la app. Si `@nestjs/swagger` no puede producir 3.1, **detente y repórtalo** (ver preguntas abiertas).

### Persistencia
- [x] drizzle-kit configurado (`drizzle.config.ts`) con una migración inicial vacía en `drizzle/` (por ejemplo `drizzle-kit generate --custom --name=init`); `pnpm db:migrate` funciona contra PostgreSQL.
- [x] Un test de integración con Testcontainers (`postgres:16-alpine`) aplica las migraciones y verifica que `GET /ready` responde `200`.

### Comandos y documentación
- [x] Funcionan `pnpm test`, `pnpm test:integration`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm build`, `pnpm start:dev`, `pnpm db:migrate` y `pnpm openapi:generate`.
- [x] `services/baseball/CLAUDE.md` se actualiza con los comandos reales y se eliminan la nota "Planeados" y la línea "Estado: el código aún no existe".

## Fuera de alcance
- Entidades del modelo de dominio (League, Game, PlateAppearance…) y estadísticas: tareas posteriores.
- Sabermetría, análisis avanzado y cualquier proceso `worker` (diferidos).
- `Dockerfile`, `docker-compose.yml` y CI en GitHub Actions: tarea de plataforma para el agente `devops` (TAREA-PL-001).
- Autenticación, OpenTelemetry (trazas) y gateway.
- `pnpm-workspace.yaml` en la raíz: el servicio es un proyecto independiente con su propio `pnpm-lock.yaml`. El workspace se define cuando se cree `apps/web` (ADR-0004).

## Archivos / áreas esperadas
- `services/baseball/package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `nest-cli.json`, `eslint.config.mjs`, `vitest*.config.ts`, `drizzle.config.ts`, `.env.example`, `openapi.yaml`
- `services/baseball/src/**`
- `services/baseball/drizzle/**`
- `services/baseball/tests/{unit,integration}/**` (los *fixtures* ya existen: no editarlos sin avisar)
- `services/baseball/CLAUDE.md` (solo la sección Comandos y la nota de estado)

## Definition of Done
- [x] Tests pasan y lint, formato y `tsc` limpios.
- [x] Sin cambios a ADRs aceptados.
- [x] Documentación actualizada si cambió un contrato o regla.
- [x] Revisado por el agente `revisor` (aprobado; H1, H2 y H7 corregidos).

## Preguntas abiertas ❓
- **OpenAPI 3.1**: `@nestjs/swagger` genera 3.0 por defecto. El desarrollador debe comprobar si puede emitir 3.1. Si no puede, no se rebaja el contrato en silencio: se detiene la tarea y el `arquitecto` propone un ADR (ADR-0002 §3 exige 3.1).
- **Migración vacía con drizzle-kit**: verificar que `generate --custom` produce una migración válida sin esquema; si no, usar el equivalente más simple y documentarlo.
- **Versión de Node**: la máquina de desarrollo tiene Node 26 (rama *Current*, no LTS). `engines` pide ≥ 22; para Docker y CI conviene fijar una LTS.
- **Prerrequisitos locales (verificados el 2026-10-16)**: Node 26.5.1, pnpm 12.14.0 y Docker 29.7.2 instalados. Docker Desktop debe estar **abierto** para `pnpm test:integration`.

## Deuda técnica registrada por el revisor (no bloqueante)
Hallazgos del 2026-10-16 que quedaron fuera de esta tarea; atenderlos en la tarea indicada:
- **H3** `problem-details.filter.ts`: un error con `statusCode` 4xx lanzado por una librería se devuelve al cliente como 4xx y no se registra. Aceptar el duck-typing solo para errores de Fastify (`code` que empiece por `FST_`).
- **H4** `tests/support/fixtures.ts`: los arrays vacíos y las claves desconocidas de los fixtures no hacen fallar la suite. Exigir `min(1)` y una lista explícita de grupos.
- **H5** `http.test.ts`: la prueba de JSON mal formado debe comprobar el cuerpo `problem+json` (400) y cubrir 415.
- **H6** `drizzle.config.ts`: `pnpm db:migrate` no carga `.env` ni da un mensaje claro sin `DATABASE_URL`.
- **H8** `services/baseball/pnpm-workspace.yaml` (solo `allowBuilds`): al crear el workspace raíz con `apps/web` (ADR-0004), comprobar que pnpm sigue tratando este servicio como raíz propia.
- **H10** `openapi.ts` (`JSON.parse` sin tipar), `@types/node ^26` frente a `engines >=22.12`, token `APP_LOGGER` importado desde `infrastructure/` en `api/`, y falta el prefijo `/api/v1/baseball` (ADR-0002 §3): definirlo en la primera tarea con endpoints de negocio.

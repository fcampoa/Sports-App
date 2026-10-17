# ADR-BB-0003: Stack del servicio de béisbol — NestJS (TypeScript) + PostgreSQL

- **Estado**: Aceptado
- **Fecha**: 2026-10-16
- **Decisores**: usuario
- **Ámbito**: **solo** `services/baseball`
- **Reemplaza a**: [ADR-BB-0001](BB-0001-stack-backend.md) (Python + FastAPI)

## Contexto
ADR-BB-0001 eligió Python por una razón principal: el análisis avanzado (sabermetría, ML) era central. El 2026-10-16 se decidió **diferir sabermetría y análisis de datos** (ver [visión](../../../00-vision.md)). Sin esa razón, la etapa 1 es un servicio de **registro y consulta de estadísticas oficiales**: conteos enteros, reglas de anotación, agregados y una API REST. Ninguna de las tres opciones tiene problemas con eso.

Se aplican los criterios de [ADR-0002](../../../adr/0002-stack-por-deporte.md) §2:

| Criterio | Peso hoy |
|---|---|
| Análisis avanzado / ML | **Ninguno** (diferido) |
| Tiempo real | Ninguno (no hay datos en vivo en la etapa 1) |
| Fuentes de datos / SDK | Por definir (D-1); ninguna opción tiene desventaja conocida |
| Equipo | **Decisivo** — no está documentado qué domina el equipo |
| Costo de un stack nuevo en el repo | Alto: el repo ya tiene TypeScript (frontend) |

## Opciones consideradas

| | **A. NestJS** (TypeScript) | **B. .NET** (C# + ASP.NET Core) | **C. Java 21** (Spring Boot 3) |
|---|---|---|---|
| Tipado y modelado del dominio | Bueno con `strict`, uniones discriminadas y `never` para exhaustividad; `number` es float, pero los conteos son enteros y las tasas se redondean al presentar (RN-GEN-003) | Muy bueno: `record`, `switch` exhaustivo, `decimal` nativo | Muy bueno: `record`, `sealed` + `switch` exhaustivo, `BigDecimal` |
| Un solo lenguaje con el frontend | ✅ | ❌ | ❌ |
| Reutiliza herramientas del repo (pnpm, ESLint, tipos de la API) | ✅ | ❌ | ❌ |
| Madurez para APIs y microservicios | Buena | Muy buena | Muy buena (la más extendida en empresas) |
| Persistencia y migraciones | Drizzle/Prisma/TypeORM + migraciones | EF Core + migraciones (muy integrado) | JPA/Hibernate + Flyway/Liquibase |
| Tests de integración con PostgreSQL real | Testcontainers (Node) | Testcontainers (.NET) | Testcontainers (Java), el más usado |
| OpenAPI 3.1 (exigido por ADR-0002 §3) | ⚠️ `@nestjs/swagger` genera 3.0 por defecto; **verificar** soporte de 3.1 | OpenAPI integrado en ASP.NET Core; **verificar** versión 3.1 en .NET 10 | springdoc-openapi con 3.1; **verificar** |
| Instalado hoy en tu máquina | Node 26 y pnpm ✅ | .NET SDK 10 ✅ | JDK ❌ (hay que instalarlo) |
| Rendimiento | Suficiente | Muy alto | Muy alto |
| Riesgo principal | Estructura laxa: hay que **vigilar** que `domain/` no importe de Nest | Dos lenguajes en el repo | Más verboso; dos lenguajes en el repo |

## Recomendación
**A. NestJS (TypeScript)**, con esta condición: *si el equipo domina más C# o Java que TypeScript, elegir B o C*, porque la experiencia pesa más que cualquier otra fila.

Razones:
1. Sin análisis avanzado desaparece lo que justificaba salir del stack del frontend.
2. Aplica la regla de desempate de ADR-0002: *reutilizar un stack ya presente en el repo*. Una persona puede mover cambios de contrato entre API y frontend sin cambiar de lenguaje, y las herramientas (pnpm, ESLint, `openapi-typescript`) ya están decididas.
3. Los conteos son enteros: la diferencia de `decimal`/`BigDecimal` frente a `number` no afecta a las fórmulas actuales.

Si se elige **B (.NET)**, es la mejor opción para un modelo de dominio estricto con poca ceremonia, y el SDK ya está instalado. **C (Java)** solo conviene si el equipo ya lo domina o si el entorno de despliegue lo exige.

## Decisión
**Opción A: NestJS (TypeScript).** Elegida por el usuario el 2026-10-16.

Stack fijado para `services/baseball`:

Detalle de cada opción (la columna A es la que rige):

| Pieza | A. NestJS | B. .NET | C. Java |
|---|---|---|---|
| Lenguaje y versión | TypeScript `strict`, Node LTS | C# 14 / .NET 10 | Java 21 |
| API | NestJS (adaptador Fastify) | ASP.NET Core (Minimal APIs o controladores) | Spring Boot 3 |
| Persistencia | Drizzle ORM + drizzle-kit | EF Core | Spring Data JPA |
| Migraciones | drizzle-kit | EF Core migrations | Flyway |
| Tests | Vitest + Testcontainers | xUnit + Testcontainers | JUnit 5 + Testcontainers |
| Calidad | ESLint + `tsc --noEmit` | analizadores Roslyn + `dotnet format` | Checkstyle/Spotless + ErrorProne |
| Gestor de paquetes | pnpm | NuGet | Gradle |
| Logs JSON | pino | Serilog (JSON) | Logback JSON encoder |
| Arquitectura | Mismas capas hexagonales; test de arquitectura que prohíba imports de `@nestjs/*` en `domain/` | Test de arquitectura (NetArchTest) | Test de arquitectura (ArchUnit) |

## Consecuencias
- Hay que **descartar el scaffold de Python de TAREA-BB-001** (aún no commiteado) y rehacer la tarea con el stack elegido. Se reutilizan sin cambios: los documentos de reglas y modelo, los *fixtures* JSON (incluido el golden file de Félix Hernández), los casos de prueba de `InningsPitched` y `Rate`, y el diseño del test de arquitectura.
- Se reescribe `services/baseball/CLAUDE.md` y se marca ADR-BB-0001 como `Reemplazado por ADR-BB-0003`.
- Desaparece el proceso `worker`/`analytics` de béisbol hasta retomar el análisis; si vuelve, se evaluará entonces (incluso un servicio Python aparte, con otro ADR).
- `apps/web` no cambia, salvo que la revalidación bajo demanda la dispara la API al pasar un partido a `FINAL`, en lugar de un worker.
- Revisar si: se retoma la sabermetría o aparece una fuente de datos con SDK solo en otro lenguaje.

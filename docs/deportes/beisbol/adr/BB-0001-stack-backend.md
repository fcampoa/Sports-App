# ADR-BB-0001: Stack del servicio de béisbol — Python + FastAPI + PostgreSQL

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario
- **Ámbito**: **solo** `services/baseball`. No es el stack por defecto de otros deportes (ver [ADR-0002](../../../adr/0002-stack-por-deporte.md)).

## Contexto
Béisbol tiene un dominio de conteo con reglas estrictas y, sobre todo, una cultura sabermétrica muy fuerte (wOBA, FIP, WAR, run expectancy, proyecciones). El análisis avanzado es parte central del producto.

## Opciones consideradas

| Opción | Pros | Contras |
|---|---|---|
| A. TypeScript + NestJS | Mismo lenguaje que el frontend | Ecosistema de análisis pobre |
| B. Java 21 + Spring Boot | Tipado fuerte, ecosistema de microservicios maduro | El análisis obligaría a un segundo servicio en Python |
| C. C# / .NET + ASP.NET Core | Rendimiento, `decimal` nativo | Ecosistema de análisis limitado |
| **D. Python + FastAPI** | Mejor ecosistema de análisis (pandas/polars, scipy, scikit-learn, pybaseball); una sola fuente de fórmulas | Tipado opcional → se mitiga con `mypy --strict` obligatorio |

## Decisión
**Opción D.**

| Pieza | Elección |
|---|---|
| Lenguaje | Python 3.13+ |
| API | FastAPI + Pydantic v2 |
| Persistencia | SQLAlchemy 2 + Alembic (migraciones) |
| Base de datos | PostgreSQL (versión estable gestionada más reciente) con vistas materializadas para agregados |
| Análisis | pandas / polars, scipy, statsmodels; scikit-learn cuando haya modelos |
| Calidad | pytest, Testcontainers, `ruff` (lint + formato), `mypy --strict` |
| Dependencias | `uv` (evitar el canal por defecto de Anaconda por licencia) |
| Ejecución | Imagen Docker única con **dos procesos**: `api` (FastAPI) y `worker` (jobs de análisis por lotes) |

## Consecuencias
- Las fórmulas viven una sola vez en `domain/` y las usan tanto la API como el worker.
- `mypy --strict` y `ruff` bloquean el CI; sin ellos se pierde la ventaja de tipado.
- El frontend (TypeScript) consume tipos generados desde el OpenAPI que publica FastAPI.
- Revisar si: aparecen requisitos de latencia en tiempo real (datos en vivo pitch a pitch) que FastAPI no cubra.

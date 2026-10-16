# Servicio de béisbol — Guía para Claude

> Este archivo aplica **solo** a `services/baseball/`. El stack de aquí no se usa en otros deportes.
> Decisión: [ADR-BB-0001](../../docs/deportes/beisbol/adr/BB-0001-stack-backend.md) · Reglas: [reglas-negocio.md](../../docs/deportes/beisbol/reglas-negocio.md) · Modelo: [modelo-dominio.md](../../docs/deportes/beisbol/modelo-dominio.md)

## Stack
Python 3.13+ · FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic · PostgreSQL · pandas/polars (worker) · pytest · Testcontainers · ruff · mypy --strict · uv

## Estructura
```
services/baseball/
  pyproject.toml
  openapi.yaml               Contrato (se valida contra el que genera FastAPI)
  src/baseball/
    domain/                  Python puro: sin fastapi, sqlalchemy, pandas ni I/O
    application/             Casos de uso y puertos (Protocol)
    infrastructure/          SQLAlchemy, importadores de datos
    api/                     Proceso 1: app FastAPI (routers, esquemas Pydantic)
    analytics/               Proceso 2: worker de jobs por lotes (pandas/polars permitido aquí)
  migrations/                Alembic
  tests/
    unit/                    Dominio, sin BD
    integration/             Con PostgreSQL en Testcontainers
    fixtures/                Box scores reales (golden files)
```

## Comandos
> Planeados; confirmar cuando exista el scaffold (TAREA-BB-001).
```
uv sync                                   # instalar
uv run pytest                             # tests
uv run ruff check . && uv run ruff format --check .
uv run mypy src                           # modo strict
uv run uvicorn baseball.api.main:app --reload   # API local
uv run python -m baseball.analytics       # worker
docker compose up                         # API + worker + PostgreSQL
```

## Convenciones
- `domain/` no importa nada de `fastapi`, `sqlalchemy`, `pandas` ni `pydantic`; usa `dataclass(frozen=True)` y `Enum`.
- Exhaustividad en `match` sobre enums con `typing.assert_never`.
- Conteos como `int`; tasas calculadas al vuelo y `None` si el denominador es 0 (RN-GEN-002). Redondear solo al presentar (RN-GEN-003).
- Entradas lanzadas guardadas como outs enteros (RN-GEN-004).
- Los tests citan el ID de regla: `def test_rn_bat_006_obp_excludes_sac_bunts(): ...`
- Toda migración de BD con Alembic; nunca modificar el esquema a mano.

# TAREA-BB-001: Scaffold del servicio de béisbol

- **Estado**: Pendiente
- **Ámbito**: béisbol
- **Agente sugerido**: desarrollador-backend
- **Depende de**: [ADR-BB-0001](../adr/BB-0001-stack-backend.md), [ADR-0002](../../../adr/0002-stack-por-deporte.md) §3

## Contexto
`services/baseball` todavía no existe. Antes de implementar estadísticas hace falta el esqueleto del proyecto con el stack aceptado (Python + FastAPI + PostgreSQL), la estructura hexagonal y las herramientas de calidad funcionando. Así cada tarea posterior solo agrega dominio y casos de uso. Incluye dos value objects mínimos del dominio para comprobar que la cadena completa funciona: tests que citan reglas, mypy strict y la frontera del dominio.

## Objetivo
Un servicio `services/baseball` que se instala con `uv sync`, levanta una API FastAPI con `/health` y `/ready`, y pasa tests, `ruff` y `mypy --strict`.

## Reglas de negocio involucradas
- `RN-GEN-002` — denominador 0 → `None`.
- `RN-GEN-004` — entradas lanzadas almacenadas como outs enteros y mostradas como `entero.resto`.

## Criterios de aceptación

### Proyecto y estructura
- [ ] **Dado** un clon limpio del repo **cuando** se ejecuta `uv sync` en `services/baseball` **entonces** se instalan las dependencias sin errores con Python 3.13+.
- [ ] Existe la estructura de `services/baseball/CLAUDE.md`: `src/baseball/{domain,application,infrastructure,api,analytics}/`, `migrations/`, `tests/{unit,integration,fixtures}/`.
- [ ] `pyproject.toml` configura `ruff` (lint + formato), `mypy` en modo `strict` y `pytest`.

### Frontera del dominio
- [ ] **Dado** cualquier módulo de `src/baseball/domain/` **cuando** se ejecutan los tests **entonces** un test falla si el dominio importa `fastapi`, `sqlalchemy`, `pydantic` o `pandas` (test de arquitectura por inspección de imports).

### Value objects de ejemplo (dominio)
- [ ] `InningsPitched` (RN-GEN-004): **dado** `outs = 20` **entonces** `display()` devuelve `"6.2"` y `as_innings()` ≈ `6.6667`; **dado** `outs = 0` **entonces** `display()` devuelve `"0.0"`; **dado** `outs = 27` **entonces** `display()` devuelve `"9.0"`; **dado** `outs = -1` **entonces** se lanza `ValueError`.
- [ ] `Rate` (RN-GEN-002): **dado** `numerator = 4`, `denominator = 12` **entonces** `value` ≈ `0.3333`; **dado** `denominator = 0` **entonces** `value` es `None`; **dado** `denominator < 0` o `numerator < 0` **entonces** se lanza `ValueError`.
- [ ] Los tests llevan el ID de regla en el nombre (ej. `test_rn_gen_004_display_20_outs_as_6_2`).

### API
- [ ] **Dado** el servicio levantado **cuando** se llama `GET /health` **entonces** responde `200` con `{"status": "ok"}` sin tocar la base de datos.
- [ ] **Dado** PostgreSQL disponible **cuando** se llama `GET /ready` **entonces** responde `200`; **dado** PostgreSQL caído **entonces** responde `503` con cuerpo `application/problem+json` (RFC 9457).
- [ ] **Dado** una ruta inexistente **cuando** se llama **entonces** la respuesta es `404` en formato `application/problem+json`.
- [ ] La configuración (URL de BD, nivel de log) se lee de variables de entorno con un `.env.example` en el servicio; no hay secretos en el repo.
- [ ] Los logs se emiten en JSON.
- [ ] Existe `services/baseball/openapi.yaml` y un test verifica que coincide con el OpenAPI generado por FastAPI.

### Persistencia
- [ ] Alembic inicializado en `migrations/` con una migración vacía inicial; `alembic upgrade head` funciona contra PostgreSQL.
- [ ] Un test de integración con Testcontainers levanta PostgreSQL y verifica `GET /ready` → `200`.

### Comandos
- [ ] Funcionan los comandos de `services/baseball/CLAUDE.md`: `uv run pytest`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy src`, `uv run uvicorn baseball.api.main:app`.
- [ ] La sección "Comandos" de `services/baseball/CLAUDE.md` se actualiza con los comandos reales y se quita la nota "Planeados".

## Fuera de alcance
- Entidades del modelo de dominio (League, Game, PlateAppearance…) y estadísticas: tareas posteriores.
- Implementación del worker de análisis: solo se crea el paquete `analytics/` con un `__main__.py` que registra un log y termina.
- `Dockerfile`, `docker-compose.yml` y CI en GitHub Actions: tarea de plataforma para el agente `devops` (TAREA-PL-001).
- Autenticación, OpenTelemetry (trazas) y gateway.

## Archivos / áreas esperadas
- `services/baseball/pyproject.toml`, `uv.lock`, `.env.example`, `openapi.yaml`, `alembic.ini`
- `services/baseball/src/baseball/**`
- `services/baseball/migrations/**`
- `services/baseball/tests/**`
- `services/baseball/CLAUDE.md` (solo la sección Comandos)

## Definition of Done
- [ ] Tests pasan y lint limpio (`ruff`, `mypy --strict`).
- [ ] Sin cambios a ADRs aceptados.
- [ ] Documentación actualizada si cambió un contrato o regla.
- [ ] Revisado por el agente `revisor`.

## Preguntas abiertas ❓
- **Prerrequisito local (verificado el 2026-10-15)**: Docker está instalado (29.7.2), pero **ni Python ni `uv` están instalados**. Instalar `uv` antes de empezar; `uv python install 3.13` instala Python sin depender de la Microsoft Store.

# Sports-App — Guía para Claude

Aplicación de estadísticas deportivas. **Un servicio de backend por deporte**, cada uno con **su propio stack**, y **un frontend React + Next.js** compartido.
**Etapa 1: béisbol.** Ningún otro deporte se implementa hasta que la etapa 1 esté cerrada.

## ⚠️ El stack depende del deporte
- **No hay stack de backend global.** Antes de escribir código de un servicio, lee `services/<deporte>/CLAUDE.md` y su ADR de stack (`docs/deportes/<deporte>/adr/XX-0001-stack-backend.md`).
- Béisbol usa Python + FastAPI ([ADR-BB-0001](docs/deportes/beisbol/adr/BB-0001-stack-backend.md)). **Eso no implica que otros deportes usen Python.**
- Para agregar un deporte usa `/nuevo-deporte`: evalúa el stack con los criterios de [ADR-0002](docs/adr/0002-stack-por-deporte.md) y propone uno; el usuario lo aprueba.
- Lo único común a todos los servicios es el **contrato de plataforma** (ADR-0002 §3): OpenAPI, RFC 9457, `/health`, Docker, BD propia, OpenTelemetry, dominio puro.

## Fuentes de verdad

### Plataforma (todos los deportes)
| Tema | Documento |
|---|---|
| Visión y alcance | [docs/00-vision.md](docs/00-vision.md) |
| Viabilidad de microservicios | [docs/01-viabilidad-microservicios.md](docs/01-viabilidad-microservicios.md) |
| Arquitectura (independiente del lenguaje) | [docs/02-arquitectura.md](docs/02-arquitectura.md) |
| Decisiones de plataforma | [docs/adr/](docs/adr/) — `ADR-NNNN` (servicio por deporte, stack por deporte, frontend, monorepo) |
| Tareas de plataforma (frontend, gateway, CI) | [docs/tareas/](docs/tareas/) — `TAREA-PL-NNN` |
| Plantillas | [docs/plantillas/](docs/plantillas/) |

### Por deporte (`docs/deportes/<deporte>/`)
| Deporte | Estado | Stack | Documentación |
|---|---|---|---|
| Béisbol (`BB`) | Etapa 1 | Python + FastAPI + PostgreSQL | [docs/deportes/beisbol/](docs/deportes/beisbol/README.md) |

Cada carpeta de deporte contiene: `README.md`, `reglas-negocio.md`, `modelo-dominio.md`, `adr/` (`ADR-XX-NNNN`) y `tareas/` (`TAREA-XX-NNN`).

Si el código contradice un documento, **el documento manda**; si el documento parece incorrecto, detente y pregunta.

## Reglas de trabajo
1. **No cambies un ADR en estado `Aceptado`** sin aprobación explícita del usuario. Para cambiar una decisión, crea un ADR nuevo que lo reemplace.
2. **No apliques decisiones de un deporte a otro.** Un ADR `XX-` solo vale para su deporte.
3. **Toda fórmula o regla estadística** tiene un ID `RN-*` en el `reglas-negocio.md` de su deporte y al menos un test que lo cite.
4. **Las estadísticas se calculan desde conteos crudos**, nunca promediando promedios.
5. **El dominio no depende de infraestructura**, en cualquier lenguaje.
6. **Sin dependencias de dominio entre deportes.** `packages/` solo contiene utilidades técnicas, nunca reglas deportivas.
7. **El frontend no calcula estadísticas**; muestra lo que entrega la API.
8. Trabaja una tarea a la vez; marca sus criterios de aceptación al terminar.
9. Idioma: documentación y mensajes al usuario en **español**; código, nombres y commits en **inglés**.

## Agentes (`.claude/agents/`)
- `arquitecto` — decisiones de plataforma, ADRs, contratos de API y evaluación de stack para deportes nuevos.
- `experto-beisbol` — reglas de anotación y fórmulas de béisbol; casos de prueba con datos reales.
- `desarrollador-backend` — implementa tareas de un servicio con el stack de **ese** deporte.
- `desarrollador-frontend` — implementa tareas en `apps/web` (React + Next.js).
- `devops` — Docker, docker-compose, CI y configuración de despliegue.
- `revisor` — revisa cambios contra ADRs (plataforma + deporte), reglas y criterios de aceptación.

Cada deporte nuevo agrega su `experto-<deporte>` (lo crea `/nuevo-deporte`).

## Skills (`.claude/skills/`)
- `/implementar-tarea` — **orquestador**: lleva una tarea de punta a punta delegando en los agentes.
- `/nueva-tarea` — crea una tarea especificada (de deporte o de plataforma).
- `/nuevo-adr` — registra una decisión (de plataforma o de deporte).
- `/nuevo-deporte` — da de alta un deporte, evalúa su stack y crea su agente experto.

## Flujo de trabajo
```
/nueva-tarea "<petición>"         →  docs/.../tareas/TAREA-XX-NNN-*.md
/implementar-tarea TAREA-XX-NNN   →  orquestador (sesión principal):
    arquitecto        (si toca contratos o requiere ADR → pausa para aprobación)
    experto-<deporte> (valida RN-* y escribe fixtures → pausa si hay ❓)
    desarrollador-*   (implementa con TDD)
    revisor           (hasta 2 ciclos de corrección)
    verificación propia de tests → tarea "Hecha" → commit solo con aprobación
```
Los subagentes no pueden lanzar otros agentes: la coordinación la hace siempre la sesión principal.

## Estructura del repositorio (objetivo)

Monorepo políglota **sin submódulos** ([ADR-0004](docs/adr/0004-monorepo.md)). No agregues `git submodule`, ni un build system global: cada servicio o app usa las herramientas de su stack.
```
CLAUDE.md                 Este archivo (reglas de plataforma)
docs/
  adr/                    ADRs de plataforma
  deportes/<deporte>/     Reglas, modelo, ADRs y tareas de cada deporte
  plantillas/             Plantillas de ADR, tarea y deporte
  tareas/                 Tareas de plataforma
services/
  baseball/               Servicio de béisbol — ver services/baseball/CLAUDE.md
  gateway/                API gateway / BFF (al agregar el segundo deporte)
packages/py/, packages/ts/  Utilidades técnicas compartidas por lenguaje (sin reglas deportivas)
apps/web/                 Frontend Next.js — ver apps/web/CLAUDE.md
```

# Sports-App

Plataforma de estadísticas deportivas. Un servicio de backend por deporte, cada uno con su propio stack, y un frontend Next.js compartido. **Etapa actual: béisbol.**

## Estructura

Monorepo sin submódulos ([ADR-0004](docs/adr/0004-monorepo.md)).

```
apps/
  web/                    Frontend Next.js (todos los deportes)
services/
  baseball/               Béisbol — Python + FastAPI + PostgreSQL
packages/
  py/                     Utilidades técnicas compartidas en Python (cuando hagan falta)
  ts/                     Utilidades técnicas compartidas en TypeScript (cuando hagan falta)
docs/
  adr/                    Decisiones de plataforma
  deportes/<deporte>/     Reglas, modelo, decisiones y tareas de cada deporte
  plantillas/             Plantillas de ADR, tarea y deporte
  tareas/                 Tareas de plataforma
.claude/                  Agentes y skills para desarrollar con Claude Code
CLAUDE.md                 Guía para Claude (léela también si eres humano)
```

| Componente | Estado | Stack | Guía |
|---|---|---|---|
| `services/baseball` | Por crear (TAREA-BB-001) | Python 3.13 · FastAPI · PostgreSQL | [CLAUDE.md](services/baseball/CLAUDE.md) |
| `apps/web` | Por crear | Next.js · React · TypeScript | [CLAUDE.md](apps/web/CLAUDE.md) |

## Requisitos de desarrollo
- Git
- Docker Desktop
- [uv](https://docs.astral.sh/uv/) (instala Python): `uv python install 3.13`
- Node.js LTS + pnpm (para `apps/web`)

Cada servicio o app documenta sus comandos en su propio `CLAUDE.md`.

## Documentación
- [Visión](docs/00-vision.md) · [Viabilidad de microservicios](docs/01-viabilidad-microservicios.md) · [Arquitectura](docs/02-arquitectura.md)
- [Decisiones (ADRs)](docs/adr/) · [Béisbol](docs/deportes/beisbol/README.md)

## Trabajar con Claude Code
```
/nueva-tarea "<petición>"          crea una tarea especificada
/implementar-tarea TAREA-XX-NNN    la implementa delegando en los agentes
/nuevo-adr "<decisión>"            registra una decisión
/nuevo-deporte "<deporte>"         da de alta un deporte y evalúa su stack
```

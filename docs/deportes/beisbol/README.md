# Béisbol

- **Estado**: Etapa 1 — en diseño
- **Servicio**: `services/baseball`
- **Prefijo de ADRs**: `BB`
- **Stack backend**: Python + FastAPI + PostgreSQL → [ADR-BB-0001](adr/BB-0001-stack-backend.md)

## Documentos
| Documento | Contenido |
|---|---|
| [reglas-negocio.md](reglas-negocio.md) | Fórmulas y reglas con IDs `RN-*` |
| [modelo-dominio.md](modelo-dominio.md) | Entidades, invariantes, diagrama ([SVG](modelo-dominio.svg)) |
| [adr/](adr/) | Decisiones propias de béisbol |
| [tareas/](tareas/) | Tareas a implementar (`TAREA-BB-NNN`) |

> Los IDs `RN-*` son únicos **dentro de béisbol**. Otro deporte puede tener su propio `RN-GEN-001`.

## Endpoints iniciales (borrador)
```
GET  /api/v1/baseball/leagues
GET  /api/v1/baseball/seasons/{seasonId}/standings
GET  /api/v1/baseball/seasons/{seasonId}/leaders?stat=AVG&qualified=true
GET  /api/v1/baseball/players/{playerId}/stats?season=2026&split=batting
GET  /api/v1/baseball/games/{gameId}/boxscore
POST /api/v1/baseball/games
POST /api/v1/baseball/games/{gameId}/plate-appearances
```

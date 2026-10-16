# TAREA-XX-NNN: Título

> Plantilla. Deporte: `docs/deportes/<deporte>/tareas/TAREA-XX-NNN-<slug>.md`. Plataforma (frontend, gateway, CI): `docs/tareas/TAREA-PL-NNN-<slug>.md`.

- **Estado**: Pendiente | En progreso | En revisión | Hecha
- **Ámbito**: <deporte> | plataforma
- **Agente sugerido**: desarrollador-backend | desarrollador-frontend
- **Depende de**: TAREA-XXX, ADR-XXXX

## Contexto
Por qué existe esta tarea y qué valor aporta (2–4 líneas).

## Objetivo
Qué debe existir al terminar, en una frase.

## Reglas de negocio involucradas
- `RN-BAT-006` — OBP
- ...

## Criterios de aceptación
- [ ] **Dado** un jugador con 3 H, 1 BB, 0 HBP, 10 AB, 1 SF **cuando** se consulta su OBP **entonces** el resultado es `.333`.
- [ ] El endpoint `GET ...` responde según `openapi.yaml`.
- [ ] Tests unitarios citan los IDs de reglas que cubren.

## Fuera de alcance
- ...

## Archivos / áreas esperadas
- `services/<deporte>/src/...` o `apps/web/src/features/<deporte>/...`
- tests correspondientes

## Definition of Done
- [ ] Tests pasan y lint limpio.
- [ ] Sin cambios a ADRs aceptados.
- [ ] Documentación actualizada si cambió un contrato o regla.
- [ ] Revisado por el agente `revisor`.

# ADR-0004: Monorepo políglota, sin submódulos de git

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario
- **Ámbito**: plataforma

## Contexto
La plataforma tiene un servicio por deporte, cada uno con su stack ([ADR-0002](0002-stack-por-deporte.md)), más un frontend Next.js ([ADR-0003](0003-frontend-react.md)). Hay que decidir si todo vive en un repositorio o se reparte.

Hay cambios que cruzan componentes con frecuencia: el contrato `openapi.yaml` de un servicio y los tipos generados en `apps/web`, o una regla nueva junto con su página. También los documentos (`docs/`) y los agentes (`.claude/`) aplican a todo.

## Opciones consideradas
1. **Monorepo (un solo repositorio)** — cambios atómicos entre servicio y frontend en un solo PR; documentación y agentes en un único lugar; Claude ve todo el contexto. Contras: CI con filtros por carpeta; el repo crece.
2. **Monorepo con submódulos de git** (cada servicio en su repo, enlazado al principal) — permisos y versiones por repo. Contras: cada cambio son dos commits (el del submódulo y el que actualiza el puntero); un cambio de contrato + frontend no es atómico; es fácil quedar con punteros desincronizados; complica el CI, los clones (`--recursive`) y el trabajo de Claude entre repos.
3. **Multirepo (un repo por servicio)** — independencia total. Contras: documentación, agentes y plantillas duplicados o en otro repo; coordinar contratos requiere versionar y publicar paquetes.

## Decisión
**Opción 1: monorepo sin submódulos.** Cada servicio y app tiene sus propias herramientas; no se fuerza un build system único.

| Lenguaje | Herramienta | Cuándo se activa a nivel raíz |
|---|---|---|
| Python | `uv` por servicio | `uv workspace` en la raíz solo cuando exista un paquete Python compartido en `packages/py/` |
| TypeScript | `pnpm` | `pnpm-workspace.yaml` en la raíz al crear `apps/web` (incluye `apps/*` y `packages/ts/*`) |
| Otro (deportes futuros) | La de su stack | Según su ADR `XX-0001` |

- CI: un workflow por servicio o app, filtrado por carpeta (`paths:`), más uno para `docs/`.
- `packages/<lenguaje>/<nombre>` para utilidades técnicas compartidas (nunca reglas deportivas).
- Imágenes Docker y despliegue independientes por servicio, aunque compartan repositorio.

## Consecuencias
- Un PR puede cambiar contrato, servicio y frontend a la vez y probarlos juntos.
- Hay que mantener los filtros de carpeta en el CI para no ejecutar todo en cada cambio.
- Revisar si: aparecen equipos con permisos o ciclos de release separados, o una parte debe publicarse como open source. En ese caso, extraer **ese** servicio a su propio repositorio (no usar submódulos).

---
name: implementar-tarea
description: Orquestador. Lleva una tarea de docs/ de punta a punta delegando en los agentes del proyecto (arquitecto, experto del deporte, desarrollador, revisor) y verifica el resultado antes de cerrarla.
---

# Orquestar la implementación de una tarea

Tarea: $ARGUMENTS (ruta o ID, ej. `TAREA-BB-003`)

Tú (la sesión principal) eres el orquestador: **no implementas código**, delegas con la herramienta `Agent` (`subagent_type` = nombre del agente) y verificas. Los subagentes no pueden lanzar otros agentes, así que toda la coordinación pasa por ti.

## 1. Preparar
1. Localiza la tarea en `docs/deportes/<deporte>/tareas/` o `docs/tareas/`. Si su estado no es `Pendiente`, o depende de tareas que no están `Hecha`, detente y avisa.
2. Determina el ámbito y elige los agentes:

| Ámbito / contenido | Agente |
|---|---|
| Toca contratos (`openapi.yaml`), límites entre servicios o requiere un ADR | `arquitecto` (paso 2) |
| Cita reglas `RN-*` o tiene "Reglas a definir" | `experto-<deporte>` (ej. `experto-beisbol`) (paso 3) |
| `services/<deporte>/` | `desarrollador-backend` |
| `apps/web/` | `desarrollador-frontend` |
| Docker, CI, despliegue, infraestructura | `devops` |

   Si la tarea mezcla backend y frontend, divídela con `/nueva-tarea` antes de seguir.
3. Cambia el estado de la tarea a `En progreso`.

## 2. Arquitectura (solo si aplica)
Pide al `arquitecto` el contrato o el ADR necesario. Si propone un ADR, **detente**: el usuario debe aceptarlo antes de implementar.

## 3. Validar reglas (solo si aplica)
Pide al experto del deporte que:
- confirme que las reglas `RN-*` citadas son correctas y suficientes;
- escriba los casos de prueba (fixtures) en `services/<deporte>/tests/fixtures/`.

Si responde con `❓` (ambigüedades), **detente** y pregunta al usuario. No pases reglas dudosas al desarrollador.

## 4. Implementar
Delega en el desarrollador correspondiente. El prompt incluye: ruta de la tarea, reglas validadas, rutas de los fixtures y la instrucción de leer el `CLAUDE.md` del servicio o app.

## 5. Revisar (máximo 2 ciclos)
1. Delega en `revisor` indicando la tarea y los archivos cambiados.
2. Si el veredicto es **Cambios requeridos**, reenvía los hallazgos al mismo desarrollador (`SendMessage` si sigue disponible) y vuelve a revisar.
3. Tras 2 ciclos sin aprobación, detente y presenta los hallazgos pendientes al usuario.

## 6. Verificar y cerrar
1. **No confíes solo en los reportes**: ejecuta tú mismo los tests, el lint y el chequeo de tipos con los comandos del `CLAUDE.md` del servicio o app.
2. Si todo pasa, marca los criterios de aceptación y cambia el estado de la tarea a `Hecha`.
3. Resume al usuario en español: qué se hizo, qué agente hizo cada parte, resultados reales de los tests y cualquier decisión tomada.
4. **No hagas commit ni push** sin la aprobación del usuario.

## Reglas
- Nunca aceptes ni modifiques un ADR `Aceptado` en nombre del usuario.
- Una tarea a la vez. Para varias tareas independientes, pregunta al usuario si quiere ejecutarlas en sesiones separadas.
- Si un agente necesario no existe (ej. `experto-futbol`), detente y sugiere `/nuevo-deporte` o crearlo.

---
name: nueva-tarea
description: Convierte una petición del usuario en una tarea especificada (de un deporte o de plataforma) usando la plantilla del proyecto, lista para delegar a un agente.
---

# Crear una tarea nueva

Petición del usuario: $ARGUMENTS

1. **Determina el ámbito.**
   - Un deporte → `docs/deportes/<deporte>/tareas/TAREA-XX-NNN-<slug>.md` (prefijo en el README del deporte).
   - Plataforma (frontend, gateway, CI, infraestructura) → `docs/tareas/TAREA-PL-NNN-<slug>.md`.
2. Lee `docs/plantillas/tarea.md` y lista la carpeta destino para obtener el siguiente número.
3. Lee `CLAUDE.md`, los ADRs relevantes (plataforma + deporte) y el `reglas-negocio.md` del deporte.
4. Redacta la tarea:
   - Cita los IDs `RN-*` exactos. Si falta una regla, no la inventes: añade una sección "Reglas a definir" y sugiere invocar al experto del deporte (ej. `experto-beisbol`).
   - Criterios de aceptación en formato **Dado / Cuando / Entonces**, con números concretos.
   - Agente sugerido: `desarrollador-backend` (servicio) o `desarrollador-frontend` (`apps/web`).
   - Una tarea debe poder completarse en una sesión; si es más grande, divídela con dependencias.
5. Muestra al usuario un resumen de la tarea y las preguntas abiertas antes de considerarla lista.

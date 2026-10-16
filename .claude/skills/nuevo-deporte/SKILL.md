---
name: nuevo-deporte
description: Da de alta un deporte nuevo en Sports-App - crea su carpeta de documentación y evalúa qué stack de backend le conviene, sin asumir el de deportes existentes.
---

# Alta de un deporte nuevo

Deporte solicitado: $ARGUMENTS

1. **Comprueba la etapa.** Lee `CLAUDE.md`. Si la etapa vigente no está cerrada, avisa al usuario y pide confirmación antes de seguir.
2. **Elige identificadores**: carpeta `docs/deportes/<deporte-en-español>/`, servicio `services/<sport-in-english>/` y un prefijo de 2 letras que no exista (`BB` ya es béisbol).
3. **Crea la documentación** a partir de `docs/plantillas/deporte-README.md`: `README.md`, `reglas-negocio.md` y `modelo-dominio.md` como esqueletos con `❓`, y las carpetas `adr/` y `tareas/`.
4. **Evalúa el stack**, preferentemente con el agente `arquitecto`:
   - Lee `docs/adr/0002-stack-por-deporte.md` (criterios y contrato) y los ADRs `XX-0001` de los deportes existentes.
   - Pregunta al usuario lo que no sepas: análisis avanzado, datos en vivo, fuente de datos y su SDK, experiencia del equipo.
   - Compara **reutilizar un stack existente** frente a 1–2 alternativas, criterio por criterio.
   - Escribe `docs/deportes/<deporte>/adr/XX-0001-stack-backend.md` en estado `Propuesto`, con la recomendación.
5. **Crea el agente experto del deporte** en `.claude/agents/experto-<deporte>.md`, con la misma estructura que `experto-beisbol.md`: reglamento oficial de referencia, fuente de verdad en `docs/deportes/<deporte>/`, casos de prueba con datos reales y `❓` ante ambigüedades. El orquestador (`/implementar-tarea`) lo usa para validar reglas.
6. **No crees `services/<sport>/CLAUDE.md` ni código** hasta que el usuario acepte el ADR de stack. Después, genera ese `CLAUDE.md` con stack, estructura, comandos y convenciones, siguiendo el formato de `services/baseball/CLAUDE.md`.
7. Agrega el deporte a la tabla "Por deporte" de `CLAUDE.md` (raíz).
8. Resume al usuario lo creado, la recomendación de stack y las preguntas abiertas.

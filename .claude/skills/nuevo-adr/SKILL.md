---
name: nuevo-adr
description: Registra una decisión técnica o de arquitectura como un ADR nuevo, de plataforma o de un deporte, usando la plantilla del proyecto.
---

# Crear un ADR

Decisión a registrar: $ARGUMENTS

1. **Determina el ámbito.**
   - Afecta a todos los deportes o al frontend/gateway → **plataforma**: `docs/adr/NNNN-<slug>.md` (ADR-NNNN).
   - Afecta a un solo deporte → **deporte**: `docs/deportes/<deporte>/adr/XX-NNNN-<slug>.md` (ADR-XX-NNNN; el prefijo está en el README del deporte).
   - Si no está claro, pregunta.
2. Lista la carpeta correspondiente para obtener el siguiente número de 4 dígitos.
3. Usa la estructura de `docs/plantillas/adr.md`, estado `Propuesto`, fecha de hoy y el campo **Ámbito** lleno.
4. Incluye al menos dos opciones con pros y contras y una recomendación.
5. Si reemplaza un ADR existente, no lo edites salvo para cambiar su estado a `Reemplazado por ...`, y solo con aprobación del usuario.
6. Pide al usuario que acepte o rechace la decisión.

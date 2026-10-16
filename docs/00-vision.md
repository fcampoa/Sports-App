# Visión del producto

> Estado: **Borrador** — completar las secciones marcadas con `❓` antes de empezar a implementar.

## Problema
Consultar y analizar estadísticas deportivas de forma confiable, empezando por béisbol.

## Usuarios objetivo ❓
- [ ] Aficionados que consultan estadísticas
- [ ] Anotadores / ligas amateur que registran partidos
- [ ] Analistas / entrenadores
- [ ] Otro: ...

## Alcance de la etapa 1 (béisbol)

### Dentro
- Registro de ligas, temporadas, equipos, jugadores y rosters.
- Registro de partidos (box score y/o jugada a jugada — ver decisión abierta D-1).
- Cálculo de estadísticas de bateo, pitcheo y fildeo por partido, temporada y carrera.
- Tablas de posiciones y líderes con reglas de calificación.
- API REST para consultar todo lo anterior.

### Fuera (por ahora)
- Otros deportes.
- Datos en vivo / streaming.
- Estadísticas avanzadas basadas en tracking (exit velocity, spin rate…).
- Apuestas, fantasy, pagos.

## Decisiones abiertas
| ID | Pregunta | Opciones | Estado |
|---|---|---|---|
| D-1 | ¿Cómo entran los datos? | (a) captura manual de box score, (b) captura jugada a jugada, (c) importación de un proveedor externo | ❓ |
| D-2 | ¿Qué ligas/nivel? | MLB, LMP/LMB, liga amateur propia, configurable | ❓ |
| D-3 | ¿Quién consume la API? | Web propia, app móvil, terceros | ❓ |
| D-4 | Si hay proveedor externo, ¿licencia de datos? | Revisar términos (los datos de MLB tienen restricciones de uso) | ❓ |

## Métricas de éxito ❓
- Ej.: las estadísticas calculadas coinciden al 100% con una fuente oficial para un conjunto de partidos de referencia.

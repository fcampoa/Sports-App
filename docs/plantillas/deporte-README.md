# <Deporte>

> Plantilla. Copiar a `docs/deportes/<deporte>/README.md` (lo hace la skill `/nuevo-deporte`).

- **Estado**: En evaluación
- **Servicio**: `services/<deporte-en-inglés>`
- **Prefijo de ADRs**: `XX`
- **Stack backend**: ❓ → [ADR-XX-0001](adr/XX-0001-stack-backend.md) (evaluado con los criterios de [ADR-0002](../../adr/0002-stack-por-deporte.md))

## Documentos
| Documento | Contenido |
|---|---|
| reglas-negocio.md | Fórmulas y reglas con IDs `RN-*` |
| modelo-dominio.md | Entidades, evento atómico, invariantes, diagrama |
| adr/ | Decisiones propias del deporte |
| tareas/ | Tareas a implementar (`TAREA-XX-NNN`) |

## Preguntas iniciales
- ¿Cuál es el **evento atómico** (la "fuente de verdad")? Béisbol: aparición al plato. Fútbol: evento con minuto. Básquetbol: posesión.
- ¿Qué estadísticas oficiales y qué análisis avanzado se esperan?
- ¿De dónde salen los datos y con qué licencia?
- ¿Hay datos en vivo?

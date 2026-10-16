# ADR-BB-0002: La aparición al plato es la fuente de verdad de las estadísticas

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario + experto-beisbol
- **Ámbito**: béisbol (antes ADR-0003 de plataforma)

## Contexto
Las estadísticas pueden guardarse ya agregadas (box score) o derivarse de hechos más finos (jugada a jugada). Depende de la decisión D-1 de la [visión](../../../00-vision.md).

## Opciones consideradas
1. **Solo box score** — captura rápida; no permite splits (vs zurdos, con corredores en base) ni auditar errores.
2. **Aparición al plato (PA) como evento** — permite recalcular todo, splits y auditoría; captura más costosa.
3. **Híbrido** — PA como fuente cuando exista; box score manual como respaldo para partidos sin detalle.

## Decisión
Opción 3: el modelo central es `PlateAppearance`; las líneas de box score (`BattingLine`, `PitchingLine`) se **derivan** de ellas. Se permite importar box scores con `source = MANUAL_BOXSCORE` cuando no hay detalle, marcándolos como no aptos para splits.

## Consecuencias
- Recalcular una temporada es determinista a partir de los eventos.
- Las carreras limpias (ER) se capturan como dato del anotador en el MVP, no se calculan (ver `RN-PIT-004`).
- Corregir una jugada requiere recalcular agregados del partido, temporada y carrera.

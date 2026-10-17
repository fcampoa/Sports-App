# Reglas de negocio — Béisbol

> Referencia principal: Reglas Oficiales de Béisbol (MLB), sección 9 (Anotador oficial).
> Cada regla tiene un ID estable. **No reutilizar IDs**; si una regla se elimina, márcala como `(obsoleta)`.
> Las reglas marcadas `⚙️` son configurables por liga.

## Generales

| ID | Regla |
|---|---|
| RN-GEN-001 | Toda estadística de tasa se calcula a partir de **conteos crudos sumados**. Nunca se promedian promedios (el AVG de temporada no es el promedio de los AVG por partido). |
| RN-GEN-002 | Si el denominador es 0, el resultado es `null` (se muestra `—`), nunca `0` ni error. |
| RN-GEN-003 | Redondeo solo al presentar. AVG, OBP, SLG, OPS, ISO, BABIP, FPCT: 3 decimales, sin cero inicial si < 1 (`.300`, `1.050`). ERA, WHIP, K/9, BB/9: 2 decimales. |
| RN-GEN-004 | Las entradas lanzadas se almacenan como **outs enteros** (`outs_recorded`). Se muestran como `entero.resto` donde el resto es 0, 1 o 2 (`20 outs → "6.2"`). Para fórmulas, `IP = outs / 3`. |
| RN-GEN-005 ⚙️ | Entradas reglamentarias por juego: 9 por defecto (7 en ligas juveniles o dobles juegos). |
| RN-GEN-006 ⚙️ | Bateador designado (DH) habilitado o no por liga/temporada. |
| RN-GEN-007 | Las tasas solo admiten conteos **finitos y ≥ 0**, tanto en el numerador como en el denominador. `NaN`, `±Infinity` y los negativos son inválidos: es un error, no `null`. Esta validación ocurre **antes** del atajo de denominador 0 de RN-GEN-002 (`-1 / 0` es error, no `null`). `-0` no se rechaza: se normaliza a `0` (`-0 / 5 → 0`, nunca `-0`; `4 / -0 → null`). Las magnitudes con signo (diferencial de carreras, GB de RN-POS-002) no se modelan como tasa. |

## Bateo

| ID | Regla / Fórmula |
|---|---|
| RN-BAT-001 | **PA** (apariciones al plato) = AB + BB + HBP + SF + SH + CI (interferencia del receptor). |
| RN-BAT-002 | **AB** excluye BB, HBP, SF, SH y CI. Embasarse por error o por jugada de selección (FC) **sí** cuenta como AB y no como hit. |
| RN-BAT-003 | **H** = 1B + 2B + 3B + HR. |
| RN-BAT-004 | **TB** = 1B + 2·2B + 3·3B + 4·HR. |
| RN-BAT-005 | **AVG** = H / AB. |
| RN-BAT-006 | **OBP** = (H + BB + HBP) / (AB + BB + HBP + SF). SH y CI no entran en el denominador. |
| RN-BAT-007 | **SLG** = TB / AB. |
| RN-BAT-008 | **OPS** = OBP + SLG (cada uno sin redondear). |
| RN-BAT-009 | **ISO** = SLG − AVG. |
| RN-BAT-010 | **BABIP** = (H − HR) / (AB − K − HR + SF). |
| RN-BAT-011 | Un ponche (K) donde el bateador llega a primera por wild pitch o passed ball cuenta como **AB y K** para el bateador y K para el lanzador. |
| RN-BAT-012 | **RBI**: no se acredita en roletazo de doble play forzado ni cuando la carrera anota por error que no habría permitido anotar sin él. |
| RN-BAT-013 | **BB intencional (IBB)** es un subconjunto de BB; se almacena aparte y también suma a BB. |
| RN-BAT-014 ⚙️ | **Calificación para líderes de bateo**: PA ≥ 3.1 × juegos jugados por el equipo (MLB). |

## Pitcheo

| ID | Regla / Fórmula |
|---|---|
| RN-PIT-001 | **ERA** = 9 × ER / IP. (Si la liga juega 7 entradas, se puede ofrecer ERA ajustada = 7 × ER / IP ⚙️.) |
| RN-PIT-002 | **WHIP** = (BB + H) / IP. |
| RN-PIT-003 | **K/9** = 9 × K / IP; **BB/9** = 9 × BB / IP; **K/BB** = K / BB. |
| RN-PIT-004 | **ER** (carreras limpias): en el MVP las registra el anotador; el sistema **no** reconstruye entradas sin errores. Se valida ER ≤ R. |
| RN-PIT-005 | **Ganador (W)**: lanzador del equipo ganador que estaba en el juego (o fue el último en salir) cuando su equipo tomó la ventaja definitiva. Un abridor necesita ≥ 5 entradas completas (≥ 4 si el juego dura 5 entradas a la defensiva); si no, el anotador asigna al relevista más efectivo. |
| RN-PIT-006 | **Perdedor (L)**: lanzador responsable de la carrera que dio la ventaja definitiva al rival. |
| RN-PIT-007 | **Salvamento (SV)**: termina el juego ganado, no es el ganador, lanza ≥ 1 out, y cumple una: (a) entra con ventaja ≤ 3 y lanza ≥ 1 entrada completa; (b) entra con la carrera del empate en base, al bate o en el círculo de espera; (c) lanza ≥ 3 entradas. |
| RN-PIT-008 | Solo puede haber un W, un L y un SV por juego. Juego empatado/suspendido: sin decisiones hasta finalizar. |
| RN-PIT-009 ⚙️ | **Calificación para líderes de pitcheo**: IP ≥ 1.0 × juegos jugados por el equipo. |

## Fildeo

| ID | Regla / Fórmula |
|---|---|
| RN-FLD-001 | **Chances (TC)** = PO + A + E. |
| RN-FLD-002 | **FPCT** = (PO + A) / (PO + A + E). |
| RN-FLD-003 | Las estadísticas de fildeo se llevan **por posición**. |

## Partido y posiciones

| ID | Regla |
|---|---|
| RN-JUE-001 | Un juego es oficial a partir de 5 entradas (4½ si el local va ganando) ⚙️. |
| RN-JUE-002 | Consistencia del box score: suma de carreras por entrada = carreras totales del equipo; suma de R de los bateadores = carreras del equipo; outs del pitcheo de un equipo = outs de la ofensiva rival (3 × entradas, salvo walk-off). |
| RN-JUE-003 ⚙️ | Corredor automático en segunda en extra innings: la carrera que anota ese corredor **no** es limpia para el lanzador. |
| RN-POS-001 | **PCT** de victorias = W / (W + L). |
| RN-POS-002 | **Juegos detrás (GB)** = ((W_líder − W_equipo) + (L_equipo − L_líder)) / 2. |
| RN-POS-003 ⚙️ | Criterios de desempate: definidos por liga (ej. enfrentamientos directos, diferencial de carreras). |

## Pendientes de validar ❓
- ¿Qué ligas concretas y qué reglas ⚙️ aplica cada una?
- Estadísticas avanzadas (wOBA, FIP, WAR): **diferidas** (decisión 2026-10-16). No definir reglas `RN-*` para ellas hasta retomarlas.

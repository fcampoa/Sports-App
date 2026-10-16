# ADR-0002: Cada deporte elige su stack de backend; la plataforma fija un contrato común

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario

## Contexto
Cada deporte es un servicio autónomo ([ADR-0001](0001-servicio-por-deporte.md)). Sus necesidades pueden diferir (análisis, datos en vivo, SDKs de proveedores), así que el stack de un deporte no debe imponerse a los demás. Al mismo tiempo, cada stack nuevo tiene un costo (CI, imágenes, conocimiento del equipo).

## Decisión

### 1. El stack se decide por deporte
- Se registra en `docs/deportes/<deporte>/adr/XX-0001-stack-backend.md` (prefijo de 2 letras por deporte: `BB` béisbol, `FB` fútbol, `BK` básquetbol…).
- Se hereda en el código mediante `services/<deporte>/CLAUDE.md`.
- **El stack de béisbol ([ADR-BB-0001](../deportes/beisbol/adr/BB-0001-stack-backend.md)) no es un valor por defecto.**

### 2. Criterios para elegir el stack de un deporte nuevo
Evaluar y documentar cada uno en el ADR del deporte:

| Criterio | Pregunta |
|---|---|
| Análisis | ¿Qué tan central es el análisis avanzado / ML en ese deporte? |
| Tiempo real | ¿Se necesitan datos en vivo con latencia baja (WebSockets, streaming)? |
| Fuentes de datos | ¿El proveedor de datos ofrece SDK en algún lenguaje concreto? |
| Equipo | ¿Qué domina quien va a mantenerlo? |
| Costo de un stack nuevo | Reutilizar un stack existente en el repo es más barato: un stack distinto debe justificar su beneficio |

Regla de desempate: si ningún criterio da una ventaja clara, **reutilizar un stack ya existente en el repositorio**.

### 3. Contrato obligatorio para todo servicio de deporte (independiente del lenguaje)
- API REST bajo `/api/v1/<deporte>/...` documentada en `services/<deporte>/openapi.yaml` (OpenAPI 3.1).
- Errores en formato RFC 9457 (`application/problem+json`).
- Endpoints `/health` y `/ready`.
- Imagen Docker; configuración por variables de entorno.
- Base de datos o esquema propio; ningún otro servicio accede a ella directamente.
- Logs estructurados (JSON) y trazas con OpenTelemetry.
- Dominio puro, separado de la infraestructura ([02-arquitectura.md](../02-arquitectura.md)).
- CI con lint, chequeo de tipos y tests en cada PR.

## Consecuencias
- El frontend y el gateway solo dependen del contrato, no del lenguaje de cada servicio.
- Puede haber más de un stack en el repo; cada uno necesita su propio pipeline de CI.
- Revisar si: mantener varios stacks se vuelve costoso para el equipo.

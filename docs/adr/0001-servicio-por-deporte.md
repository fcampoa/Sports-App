# ADR-0001: Un servicio de backend por deporte, desplegado de forma incremental

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario

## Contexto
Cada deporte tiene un dominio propio (ver [viabilidad](../01-viabilidad-microservicios.md)). La etapa 1 solo incluye béisbol y el equipo es pequeño.

## Opciones consideradas
1. **Monolito con modelo genérico para todos los deportes** — simple al inicio; el modelo se degrada con cada deporte nuevo.
2. **Microservicios por deporte + transversales desde el día 1** — límites claros; overhead alto sin beneficio inmediato.
3. **Monorepo con un servicio autónomo por deporte, creado cuando se necesite** — límites claros sin overhead prematuro.

## Decisión
Opción 3. `services/baseball` es autónomo (BD/esquema propio, API propia). Se agrega gateway y servicios transversales solo al incorporar el segundo deporte o una necesidad real.

## Consecuencias
- Positivas: el dominio de béisbol queda aislado y fácil de delegar/probar.
- Negativas: al llegar el segundo deporte habrá que introducir gateway y autenticación compartida.
- Revisar si: aparecen requisitos que cruzan deportes en el núcleo del producto (p. ej. un "jugador multideporte").

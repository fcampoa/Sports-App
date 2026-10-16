# Viabilidad: un microservicio por deporte

## Pregunta
¿Conviene que el backend tenga un microservicio por deporte (béisbol, fútbol, básquetbol…)?

## Por qué el deporte es un buen límite
Cada deporte es un **bounded context** distinto: su vocabulario, unidades y reglas casi no se comparten.

| Concepto | Béisbol | Fútbol | Básquetbol |
|---|---|---|---|
| Unidad de tiempo | Entradas / outs (sin reloj) | Minutos | Cuartos + reloj |
| Evento atómico | Aparición al plato | Evento con minuto | Posesión |
| Estadística típica | AVG, ERA, OPS | Goles, xG | PTS, REB, eficiencia |

Forzar un modelo genérico "Evento deportivo" para todos lleva a tablas llenas de columnas opcionales y lógica condicional por deporte. Separar por deporte evita eso.

## Ventajas
- Modelos y reglas independientes; cambiar béisbol no rompe fútbol.
- Despliegue y escalado independiente (las temporadas no coinciden).
- Se puede elegir tecnología o equipo distinto por deporte si hiciera falta.
- Facilita delegar: cada servicio tiene su propio contexto acotado (útil también para Claude).

## Costos y riesgos
- **Overhead operativo**: CI/CD, observabilidad, versionado de contratos y despliegue por servicio.
- **Funcionalidad transversal** (usuarios, favoritos, búsqueda global, notificaciones) necesita un lugar propio.
- **Entidades que parecen compartidas** (persona, ciudad, estadio) se duplican o requieren un servicio de catálogo.
- Con **un solo deporte y un equipo pequeño**, los microservicios no aportan todavía: hoy sería un solo servicio.

## Recomendación
**Sí es viable, pero de forma incremental:**

1. **Etapa 1**: un monorepo con `services/baseball` como servicio **autónomo** (su propia base de datos o esquema, su propia API, sin importar código de otros deportes). Sin gateway todavía si solo hay un consumidor.
2. **Etapa 2** (segundo deporte): agregar `services/<deporte>` y un **gateway/BFF** que unifique rutas y autenticación.
3. **Servicios transversales** (identidad, usuarios, búsqueda) solo cuando exista la necesidad real.
4. `packages/shared` solo contiene utilidades técnicas; **nunca modelos de dominio**.

### Criterios para crear un servicio nuevo
- Es un deporte nuevo, **o**
- Una capacidad transversal tiene requisitos de escalado/seguridad propios (p. ej. autenticación).

### Comunicación entre servicios (cuando aplique)
- Consultas: HTTP/REST a través del gateway.
- Integraciones asíncronas (p. ej. "partido finalizado" → notificaciones): eventos en un broker. No necesario en etapa 1.

Decisión formal: [ADR-0001](adr/0001-servicio-por-deporte.md).

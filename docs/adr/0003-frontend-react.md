# ADR-0003: Frontend único en React + Next.js para todos los deportes

- **Estado**: Aceptado
- **Fecha**: 2026-10-15
- **Decisores**: usuario
- **Ámbito**: plataforma (`apps/web`)

## Contexto
A diferencia del backend, el frontend es **un solo producto** para el usuario: navegación, diseño y cuenta compartidos entre deportes. Necesita SEO (páginas de jugador y equipo indexables), tablas complejas, visualizaciones y uso móvil.

## Decisión
- **React + TypeScript**, una sola aplicación en `apps/web`, con un módulo por deporte (`src/features/<deporte>/`, rutas `/<deporte>/...`).
- **Framework: Next.js (App Router)**, por SSR/ISR: páginas casi estáticas servidas por CDN y regeneradas cuando termina un partido. Se descartó React + Vite (SPA) porque sin renderizado en servidor las páginas no son indexables.
- Librerías sugeridas: Tailwind CSS, TanStack Query, TanStack Table, Recharts (gráficas simples), D3/visx (spray charts, mapas de zona).
- Cliente tipado por deporte generado desde `services/<deporte>/openapi.yaml` con `openapi-typescript`.

## Consecuencias
- **El frontend no calcula estadísticas**: muestra lo que entrega la API, para que las fórmulas existan en un solo lugar (el dominio de cada deporte).
- Agregar un deporte = nuevo módulo en `apps/web/src/features/<deporte>/` + cliente generado; no un frontend nuevo.
- Revalidación bajo demanda: cuando un partido pasa a `FINAL`, el worker del deporte llama a un endpoint protegido de Next.js que regenera solo las páginas afectadas (partido, jugadores, equipos, líderes).
- Next.js necesita un runtime de Node.js en producción (Vercel o un contenedor `output: "standalone"`), no solo archivos estáticos.
- App móvil (D-3): primero PWA; después React Native (Expo) reutilizando tipos y lógica de datos.

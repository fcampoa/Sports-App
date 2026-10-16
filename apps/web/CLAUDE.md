# Frontend (apps/web) — Guía para Claude

> Aplica a `apps/web/`. Decisión: [ADR-0003](../../docs/adr/0003-frontend-react.md) (Aceptado). Una sola app para todos los deportes.

## Stack
Next.js (App Router) · React · TypeScript (strict) · Tailwind CSS · TanStack Query · TanStack Table · Recharts · D3/visx · openapi-typescript · Vitest + Testing Library · Playwright (e2e) · pnpm

## Estructura
```
apps/web/
  next.config.ts            output: "standalone" (imagen Docker)
  src/
    app/                    Rutas (App Router): solo composición, sin lógica
      layout.tsx
      page.tsx              Portada multideporte
      beisbol/
        page.tsx
        jugadores/[playerId]/page.tsx
        equipos/[teamId]/page.tsx
        juegos/[gameId]/page.tsx
        lideres/page.tsx
      api/revalidate/route.ts   Revalidación bajo demanda (llamada por los workers)
    features/
      baseball/             Componentes, hooks y consultas de béisbol
      <deporte>/            Un módulo por deporte; no se importan entre sí
    api/
      baseball/             Tipos generados desde services/baseball/openapi.yaml (no editar a mano)
    shared/                 Layout, diseño, tablas y gráficas genéricas (sin lógica deportiva)
```
Rutas en español (`/beisbol/...`); carpetas de código en inglés (`features/baseball`).

## Comandos
> Planeados; confirmar cuando exista el scaffold.
```
pnpm install
pnpm dev                    # servidor local
pnpm lint && pnpm typecheck
pnpm test                   # Vitest
pnpm test:e2e               # Playwright
pnpm gen:api                # regenera src/api/<deporte>/ desde los openapi.yaml
pnpm build
```

## Renderizado y datos
- **Server Components por defecto**: las páginas de jugador, equipo, juego y líderes se renderizan en el servidor para SEO.
- **ISR**: `fetch` con `next: { tags: [...] }` (ej. `player:123`, `game:456`, `leaders:2026`). El worker llama a `POST /api/revalidate` con los tags afectados cuando un partido pasa a `FINAL`. El endpoint exige un secreto en el header.
- **Client Components** (`"use client"`) solo para interactividad: ordenar o filtrar tablas, gráficas y selectores. Ahí se usa TanStack Query.
- `generateMetadata` en cada página de jugador, equipo y juego (título, descripción, Open Graph).

## Reglas
- **No calcular estadísticas** (AVG, ERA…) en el frontend: mostrar lo que entrega la API. Solo se permite formato (por ejemplo `.300`).
- Los tipos de la API se generan con `openapi-typescript`; si cambia el contrato, se regeneran, no se editan.
- Las URLs de los servicios y el secreto de revalidación van en variables de entorno del servidor, nunca con prefijo `NEXT_PUBLIC_`.
- Mobile-first; tablas usables en pantallas de 375 px.
- Componentes genéricos (tabla de líderes, gráfica de tendencia) en `shared/`; lo específico de un deporte, en su `features/`.

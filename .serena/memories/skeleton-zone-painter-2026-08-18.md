# Skeleton zone painter (2026-08-18)

Interactive mapper for anthropometry polygons. User paints clusters; agent applies the exported JSON to `ZONE_HOLES`.

- Dev-only route: `/dev/skeleton-zones` (`src/app/dev/skeleton-zones/page.tsx`, `notFound()` in production).
- Client UI: `src/components/clients/skeleton-zone-painter.tsx`.
- Click/drag holes onto a group (Шия/Груди/Талія/Таз/Біцепс/Стегно/Ікра). Eraser unpaints. Starts empty; localStorage key `fitapp:skeleton-zone-paint`.
- Export: Copy JSON or download `skeleton-zones.json` with `{ neckCm: number[], ... }`.
- When the user pastes that JSON, replace `ZONE_HOLES` in `src/components/clients/skeleton-zone-map.ts`. App fill stays `var(--primary)`.

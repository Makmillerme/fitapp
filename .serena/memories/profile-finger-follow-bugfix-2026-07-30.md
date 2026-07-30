## Bugfix: photo left-shift + menu ghost + query_wait_timeout — 2026-07-30

### Photo shift / menu
Root cause: when `expandProgress >= 0.5`, `items-center` was removed and hero used `width=content` + asymmetric bleed (`marginLeft/Right: -12`) → square jumped left. Overlay stayed interactive mid-drag → accidental kebab/menu hits.

Fixes:
- Full-bleed wrapper `-mx-3 sm:-mx-5` around hero
- Center via `marginLeft = (containerWidth - size) / 2` (grows from center to edges)
- Overlay/carousel only when `!isDragging` (carousel `p > 0.98`)
- `touch-action: pan-y`; `onTouchCancel` settles like end

### DB `08P01 query_wait_timeout`
Remote PgBouncer `:6432`. Client `pg.Pool` had unlimited default max; HMR/parallel RSC exhausted pool.
- `src/lib/prisma.ts`: `max: 3` (dev) / `8` (prod), idle 10s, connect timeout 15s
- Direct `select 1` OK after; ops healthcheck still warns about unmapped `postgres` maint DB (unrelated to fitapp)

# Anthropometry: shoulders + forearm (2026-08-18)

Added two measurement zones:
- `shoulderCm` — UI label **Плечі**, Zod max 180
- `forearmCm` — UI label **Передпліччя**, Zod max 80

## UI / painter order
Шия → Плечі → Груди → Біцепс → Передпліччя → Талія → Таз → Стегно → Ікра

## ZONE_HOLES
Painted and applied: `shoulderCm` [14, 15], `forearmCm` [32, 33, 40, 41, 44, 47]. See `mem:anthropometry-zone-mapping-ref-2026-08-18`.

Painter colors: shoulders `#0f766e`, forearm `#b45309`.

## Schema
Prisma `ContactMeasurement.shoulderCm` / `forearmCm` (Float?). Migration SQL: `prisma/migrations/20260818190000_measurement_shoulder_forearm/migration.sql`. Applied locally via `prisma db push` (history already drifted from `db push`).

## Files
- prisma/schema.prisma
- src/lib/actions/clients.ts
- skeleton-zone-map.ts, skeleton-zone-painter.tsx
- body-measurements-card.tsx, measurement-edit-dialog.tsx
- client-detail-view.tsx, client-card-drawer.tsx

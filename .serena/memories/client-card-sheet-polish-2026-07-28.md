# Client card Bottom Sheet polish

**Date:** 2026-07-28

## Changes
- `client-card-drawer.tsx`: height `74dvh` (was 92), `rounded-t-3xl`, `pb-safe`, brand borders; swipe-down + overlay close kept via Drawer; passes `onClientPatched`.
- `client-detail-view.tsx`: brand tokens (`primary`, `border`, `card`, `shadow-card`/`shadow-float`); Send = outline circle + primary icon; contraindications card with primary/10 + border; balance + WOD cards bordered; tabs Огляд/Прогрес/Історія/Нотатки; balance adjust returns patch via `updateClientBalance`.
- `clients.ts`: `updateClientBalance` now returns updated Contact.
- `clients-view.tsx`: local `clientItems`/`countItems` state; create/promote upsert list without `window.location.reload` (uses `router.refresh`); sheet balance changes patch list + counts.

## UX contract
- Open: tap client row
- Close: swipe down or tap outside
- Height: ~74dvh
- No hard reloads on clients CRM mutations

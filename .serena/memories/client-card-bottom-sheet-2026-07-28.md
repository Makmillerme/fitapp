# Client card = Bottom Sheet (not a page)

**Date:** 2026-07-28

## Product clarification
- Bottom Nav (workspace CRM tabs): Розклад, Клієнти, Програми, AI — these are **tabs**, not the client card.
- Client card is a **Bottom Sheet** (`Drawer`) over the clients list. Not a standalone route UX.

## Implementation
- `src/components/clients/client-card-drawer.tsx` — Drawer `h-[92dvh]`, swipe handle, loads `getClientDetail(clientId)` when open.
- `ClientDetailView` — sheet content only (no back header / no page chrome); `onUpdated` reloads detail after balance change.
- `ClientsView` — row click sets `cardClientId` → opens drawer; supports deep link `?client=<id>` then clears query.
- Legacy `/clients/[clientId]` redirects to `/clients?client=<id>`.

## Tabs inside card (shell)
Огляд | Прогрес | Історія | Нотатки — attributes TBD later.

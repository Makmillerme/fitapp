# FAB add button — context-aware dialogs (2026-07-24)

## Problem
Central FAB linked always to `/schedule?action=add`. `openCreate` via `useState(prop)` only read initial value — client navigation with `?action=add` did not open dialog until full reload.

## Solution
- Hook `src/hooks/use-action-dialog.ts`: listens to `?action=add`, opens dialog, clears query via `router.replace`.
- `BottomNav`: FAB href depends on current section (`/schedule`, `/clients`, `/programs`); disabled on `/ai`.
- Removed duplicate add UI: ScheduleView dashed button, ClientsView bottom button, ProgramsView create grid.
- Trainer layout wraps children in `<Suspense>` for `useSearchParams`.

## Usage
FAB → `/clients?action=add` etc. → matching view opens create dialog immediately without reload.

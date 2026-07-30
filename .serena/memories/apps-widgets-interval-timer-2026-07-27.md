## Apps tab = training widgets (2026-07-27)

**Concept:** `/apps` is NOT CRM modules. It's a launcher for standalone training widgets (timers, tools) separate from workspace bottom nav.

**Registry:** `src/lib/apps/widgets.ts` — `WIDGET_APPS` array with id, label, href, Component.

**First widget:** Interval timer at `/apps/interval-timer`
- SmartWOD-style: work/rest durations, rounds, prep countdown
- Settings persisted in localStorage (`fitapp:interval-timer-config`)
- Phases: prep → work ↔ rest → done
- 0 rest seconds skips rest phase
- Files: `interval-config.ts`, `use-interval-timer.ts`, `interval-timer-view.tsx`, `duration-field.tsx`
- Dynamic route: `apps/[widgetId]/page.tsx`

**AppsView:** grid from WIDGET_APPS registry; unavailable widgets show "Незабаром" badge.

**Existing:** `WorkoutTimer` overlay on schedule remains separate (appointment quick timer).
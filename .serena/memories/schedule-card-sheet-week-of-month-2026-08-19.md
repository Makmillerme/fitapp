## Schedule card simplify + appointment sheet (2026-08-19)

- Kanban cards: no photo, no red stripe; `border-border`; kebab top-right via flex; tap opens sheet (ignore move >8px).
- Today column no longer `border-primary`.
- Peek: column `w-[calc(100%-3rem)]`, scroller `px-4`.
- DnD: scrollToDay when hover/drop target column changes.
- Header pager: `getWeekOfMonth(monday, weekStartsOn:1)` not ISO week-of-year.
- `AppointmentCardDrawer` — same Drawer pattern as client card; fields: client, date, time, duration, program, location, status, notes; actions timer/briefing/program.

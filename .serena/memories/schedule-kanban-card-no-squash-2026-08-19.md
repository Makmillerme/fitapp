# Kanban cards no longer squash (2026-08-19)

Column body: outer `flex-1 min-h-0 overflow-y-auto`, inner `flex flex-col gap-2`. Cards `h-auto shrink-0` so overflow-hidden + flex does not flatten them; extra cards scroll in the middle of the day column. `onVisibleDayChange` is optional (`?.`) to survive Fast Refresh mismatches.

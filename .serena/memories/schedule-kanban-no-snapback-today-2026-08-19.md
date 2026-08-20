# Kanban no longer snap-back to today (2026-08-19)

Cause: `scrollToDay(today)` ran in an effect that depended on `reportVisibleDay`. Scrolling updated `selectedDate` → new inline `onVisibleDayChange` → effect again → jump to today.

Fix: snap to today only when `daysKey` (week) changes. `onVisibleDayChange` lives in a ref; ScheduleView uses a memoized `handleVisibleDayChange`.

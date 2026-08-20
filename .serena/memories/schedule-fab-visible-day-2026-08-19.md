# Schedule FAB uses visible day (2026-08-19)

- Column footer «Додати» removed. Create is only the bottom nav Plus (`/schedule?action=add`).
- `WeekKanbanBoard` reports the snapped/centered day via `onVisibleDayChange` (scroll + after snap). `ScheduleView.selectedDate` follows that day, so the create dialog default date is the list the user is looking at, not always today.

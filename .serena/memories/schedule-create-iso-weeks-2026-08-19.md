# Schedule: create without reload + ISO month weeks (2026-08-19)

- Create no longer calls `window.location.reload()` or `revalidatePath`. `createAppointment` returns serialized `ScheduleAppointment` (client+program). `ScheduleView` keeps `items` and appends the new card.
- Week label is not `getWeekOfMonth` (that counted calendar grid cells, 5–6+ per month). `getIsoMonthWeek` in `schedule-week.ts`: week belongs to the month of its Thursday; number is 1…4 or 1…5 among those weeks. Header: `Тиждень N з M`.
- Leftover days at month edges belong to the adjacent month’s week (ISO), so a 31-day month is not shown as 6–7 weeks.

## Schedule week kanban (2026-08-19)

- Shadcn block `kanban-application-01` is at `src/components/shadcn-space/blocks/kanban-application-01/` with demo page `src/app/kanban-application-01/page.tsx` (ADMIN via `requireRole`). Aliases: `@/components`, `@/lib/utils`.
- Dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`. Existing shadcn `button`, `card`, `input` reused; no extra globals.css.
- Product schedule (`/schedule`) is a 7-column week board (Mon–Sun, `weekStartsOn: 1`). Header chevrons page by week. Today’s column is highlighted and `scrollIntoView({ inline: "center" })` on week change.
- Cards are real appointments. Cross-day drag calls `moveAppointmentToDay` in `src/lib/actions/appointments.ts` (keeps clock time, parses `yyyy-MM-dd` locally). Plus on a column opens `CreateAppointmentDialog` for that date.
- Page loads appointments from weekStart-8 weeks to +12 weeks so paging does not refetch immediately.

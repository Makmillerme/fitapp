# Week kanban: center snap + DnD card overlay (2026-08-19)

- Columns: `w-[calc(100%-3rem)]`. Snap: Mon `snap-start`, Tue–Sat `snap-center snap-always`, Sun `snap-end`. Scroller `px-2`.
- `scrollToDay`: first day left-align, last right-align, middle days column-center = scroller-center. Same for today-on-mount and DnD auto-scroll.
- Visual extracted as `AppointmentKanbanCardFace` in `week-kanban-card.tsx`. `DragOverlay` uses that face with `event.active.rect.current.initial.width`, `interactive={false}` (kebab is visual only).

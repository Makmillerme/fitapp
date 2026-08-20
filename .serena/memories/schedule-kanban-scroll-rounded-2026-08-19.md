# Kanban scroll vs DnD + rounded cards (2026-08-19)

- Sensors: `MouseSensor` (distance 8) + `TouchSensor` (delay 220, tolerance 14). Removed `PointerSensor` — it stole pans after ~12px and blocked board/list scroll on touch.
- Cards: `touch-pan-x touch-pan-y` (no `touch-none`). Horizontal pan on a card scrolls the week scroller; vertical pan scrolls the day list (`overflow-y-auto overflow-x-hidden`).
- Click still opens (mouse distance / touch delay). Hold then move = DnD.
- Card chrome: one `rounded-xl` + `ring-border`, no extra square `border`. Sortable wrapper and DragOverlay also `overflow-hidden rounded-xl` so the ghost/preview is not sharp-cornered.

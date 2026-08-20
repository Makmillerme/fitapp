# Kanban DnD overlay + desktop + today border (2026-08-19)

- Desktop cross-column drag failed because card `onPointerDown` overwrote PointerSensor (`listeners.onPointerDown`). Touch still worked via `onTouchStart`. Now the handler calls `listeners.onPointerDown` then records click-vs-drag.
- While dragging, source sortable transform is disabled so only `DragOverlay` follows the pointer. Drop animation disabled (`null`) so preview is not delayed/snapped oddly.
- Column droppable is the whole day card (header+list), not only the inner list.
- Today column: `border-2 border-red-500`.

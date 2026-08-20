## Schedule kanban polish (2026-08-19)

- Viewport in `src/app/layout.tsx`: `maximumScale: 1`, `userScalable: false` (pinch-zoom off). Board also `touch-pan-x touch-pan-y`.
- `/schedule` header: week range is the `h1` (`text-2xl`); Calendar `size-9` placeholder in actions; week chevrons in a row under the header.
- Columns: full-ish width `w-[calc(100%-1.5rem)]`, `snap-start snap-always`, count in primary, kebab “Сьогодні”, footer “+ Додати”.
- Cards: `Card`, photo/placeholder, fields, status Badge, actions in DropdownMenu (drag on body only).
- DnD: no live cross-day `onDragOver`; move on `onDragEnd`; `pointerWithin` then `rectIntersection`; horizontal scroller excluded from autoScroll.

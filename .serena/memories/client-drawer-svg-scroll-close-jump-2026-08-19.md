## Client card drawer: SVG scroll + close jump (2026-08-19)

- Base UI `findScrollableAncestor` / `isHTMLElement` **не ходить по SVG**. Тач по `<svg>` схеми замірів трактується як swipe-to-dismiss, скрол вкладки «Прогрес» блокується. Фікс: обгортка `div.touch-pan-y` + `pointer-events-none` на svg (зони як і раніше кнопками справа).
- Закриття sheet з Прогрес/Історія/Нотатки: `setDetail(null)` при `open=false` знімав контент **під час** анімації → `--drawer-height` стискався, білий sheet/handle під nav. Тепер clear лише в `onOpenChangeComplete`, якщо `openRef.current` ще false.

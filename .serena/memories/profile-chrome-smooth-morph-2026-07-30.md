## Profile collapsed chrome smooth morph — 2026-07-30

Collapsed name/status + plain action buttons no longer snap via `maxHeight: 0` at progress≈1 (that made the info card jump up).

Now:
- Measure natural chrome height (`ResizeObserver` on inner)
- Outer clip height = `lerp(natural, 0, progress)` continuously with finger/settle
- Opacity + slight `translateY`/`scale` so name/buttons visually merge toward overlay
- Info card stays in normal flow; only tiny marginTop lerp — no layout snap

File: `src/components/profile/profile-view.tsx`

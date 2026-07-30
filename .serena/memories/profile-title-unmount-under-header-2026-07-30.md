## Hide profile title when photo expanded — 2026-07-30

User: title «Профіль» stayed visible/active when photo open; wanted photo under header with info card still flowing below.

Changes in profile-view.tsx:
- Unmount title at p>0.4 → `<span className="sr-only">` only (not opacity/visibility hacks)
- Header transparent + pointer-events none when p>0.55; menu keeps pointer-events-auto
- scrollPadTop → 0 when expanded so photo sits under header; info card stays next in flow after hero
- Header padding tightens with p

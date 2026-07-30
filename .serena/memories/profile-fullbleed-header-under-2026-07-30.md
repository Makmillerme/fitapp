## Profile expand: full width + header under photo — 2026-07-30

1. Removed `Math.min(trackWidth, 420)` — expandedSize = full trackWidth.
2. Header title fades/hides at p>0.65; header `pointer-events:none` when p>0.55; menu keeps `pointer-events:auto`. Transparent bg so photo sits under header when expanded.
3. `scrollPadTop = headerHeight + 12` when collapsed so circle brand ring isn't clipped by absolute header.

File: profile-view.tsx

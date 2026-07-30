# Dev preview frame (2026-07-27)

In `NODE_ENV=development` only:
- `src/app/layout.tsx`: body bg `#E4E4E7` (grey) instead of `#FAFAFA`.
- `src/app/(trainer)/layout.tsx`: app shell gets thin border `#C4C4C8` + subtle outer shadow so 430px frame is visible in browser testing.

Production/TWA unchanged (same bg, no border).

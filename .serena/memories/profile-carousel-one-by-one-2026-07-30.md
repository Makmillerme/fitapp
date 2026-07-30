# Profile carousel — one photo per swipe (2026-07-30)

Native free-scroll + snap still allowed flinging through all photos. Replaced with controlled pager:

- `overflow-hidden` track + `translate3d` (no native momentum scroll)
- Pointer capture: finger-follow `dragPx` clamped to **±1 page** from gesture start
- On release: threshold ~18% width or velocity → `index ± 1` only; smooth 280ms ease
- Edges: cannot drag past first/last

File: `src/components/profile/profile-photo-hero.tsx`

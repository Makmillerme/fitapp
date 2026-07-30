## Profile Photo Hero rewrite from scratch — 2026-07-30

### Problem
Dual absolute layers (photo in Hero + chrome in ProfileView) with independent left/width lerp formulas + lockedChromeHRef caused desync, jumps, false kebab hits.

### Fix
Single authoritative `ProfilePhotoHero`:
- One container height = `lerp(96+gap+chromeH, max(that, expandedSize), p)`
- Photo absolute top-0, size/radius/left from same progress
- Chrome (name, status, pencil, buttons, styles) absolute at fixed `top=96+12`; left/width lerp from same `photoLeft`/`photoSize`
- Hidden measurer (`visibility:hidden`) for chromeH via ResizeObserver — no locked-effect
- Kebab on photo; carousel only `p>0.98 && !isDragging && photos.length>1`
- `pointerEvents` gated by `!isDragging`

`ProfileView`: gesture engine kept; removed chromeRef/lockedChromeHRef/heroH/actionButtons dual chrome.

Files: `profile-photo-hero.tsx`, `profile-view.tsx`

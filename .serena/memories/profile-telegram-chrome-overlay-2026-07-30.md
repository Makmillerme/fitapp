## Telegram-simpler profile chrome — 2026-07-30

Replaced dual chrome (collapse below + fade-in overlay) with one layer:
- Hero track height = `lerp(96+gap+chromeH, fullBleedW, progress)` — info card only moves with this growth (no snap up)
- Photo morphs as absolute background behind chrome
- Same name+status+buttons stay on top; `top` lerps from below circle → bottom of square; text/button colors morph via `color-mix`; align center→left
- Soft gradient under chrome fades in with progress
- `ProfilePhotoHero` is photo+kebab only (`trackWidth` prop); no overlayActions/displayName

Files: `profile-view.tsx`, `profile-photo-hero.tsx`

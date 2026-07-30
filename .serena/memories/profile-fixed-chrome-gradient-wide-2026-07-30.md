## Profile expand: fixed chrome + gradient + wide cap — 2026-07-30

User feedback: gradient too tall/light; buttons moved with photo; wide screens broken.

Fixes:
- `chromeTop = 96+12` constant — name/buttons stay put, photo grows behind; only colors/align morph
- Local scrim behind chrome when p>0.12 for readability
- Photo-edge gradient: ~56px, `from-black/70` (no backdrop-blur milk)
- `expandedSize = min(trackWidth, 420)` — shell stays fluid, hero square capped/centered on desktop

Files: profile-view.tsx, profile-photo-hero.tsx

## Profile expand polish (4 bugs) — 2026-07-30

1. TrainerAppShell: removed `max-w-[430px] mx-auto` → fluid `w-full` again.
2. Frosted gradient moved inside `ProfilePhotoHero` (`from-black/30 via-black/10` + `backdrop-blur-[2px]`), clipped by photo radius — no gray bar under track.
3. Hero track: `overflow-visible` when `p ≤ 0.15`, `overflow-hidden` when expanding (circle ring no longer clipped).
4. Chrome: `lockedChromeH` only measured at `progress ≈ 0`; `chromeTop = lerp(96+12, photoSize - lockedH - 12, p)`; `expandedSize = trackWidth`.

Files: trainer-app-shell.tsx, profile-photo-hero.tsx, profile-view.tsx

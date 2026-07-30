## Profile expand from page top + restore phone frame — 2026-07-30

### Why it looked broken
1. TrainerHeader stayed in normal flow → white gap above expanded photo (not Telegram edge-to-edge).
2. Shell was fluid `w-full` (430px cap removed earlier) → on desktop hero square grew to ~full width/height; layout looked “unoptimized” on all screens.
3. Buttons on photo are intentional overlay; overflow felt worse without clip + huge square.

### Fixes
- Profile: absolute header overlay; `paddingTop` lerps `headerH→0` so photo reaches page top; title fades; menu button goes translucent white on expand.
- Hero `overflow-hidden`; expanded size capped `min(trackWidth, 430)`; chrome/gradient aligned to photo box; name left after p≈0.3.
- `TrainerAppShell`: restored `max-w-[430px] mx-auto` (mobile-first frame) for consistent polish.
- `TrainerHeader`: optional `style`, `menuButtonClassName`.

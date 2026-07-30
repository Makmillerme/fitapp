# Profile finger-follow photo expand (Telegram-like) — 2026-07-30

## Change
Replaced boolean `photoExpanded` snap with continuous `expandProgress ∈ [0,1]` driven by finger during drag, then rAF settle open/close by progress + velocity.

## Files
- `src/lib/profile/expand-progress.ts` — `clamp`, `lerp`, `easeOutCubic`, `animateProgressTo`
- `src/components/profile/profile-photo-hero.tsx` — props `progress` / `isDragging` / `onExpandRequest` / `onCollapseRequest`; size/radius/bleed/ring/overlay lerp; soft gradient `from-black/40 via-black/15`; carousel only if `progress > 0.9`
- `src/components/profile/profile-view.tsx` — full-surface vertical drag: `delta = dy / min(280, width*0.75)`; start expand only if `scrollTop≤8` + photos (or already mid/open); lock `overflowY` while vertical morph; settle if `progress≥0.35` or `|vy|>0.6 px/ms`; collapsed name/buttons fade by `1-progress`

## Behavior
- Drag down from circle → square follows finger; release early → spring to 0
- Drag up from full → collapse follows finger
- Tap avatar → `settleTo(1)`
- No framer; native touch + rAF only

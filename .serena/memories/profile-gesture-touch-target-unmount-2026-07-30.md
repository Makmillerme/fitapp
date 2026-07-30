## Photo-zone gesture freeze mid-expand — 2026-07-30

Symptom: swipe outside photo OK; swipe on photo freezes at mid progress (ring + name under square).

Cause: expand tap `<button>` unmounted when `p` crossed 0.5 mid-drag → browser lost touch target; touchend/settle never ran.

Fixes:
- Keep activate button always mounted; toggle `pointerEvents` instead of unmount
- Chrome `pointerEvents` only at ends (p<0.08 or p>0.92) so mid-morph touches reach scroll parent
- `touchAction: none` while isDragging on hero root
- ProfileView touchend/cancel: if progress stuck mid-range without axis lock, settle to nearest

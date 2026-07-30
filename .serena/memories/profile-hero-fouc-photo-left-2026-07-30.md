## FOUC: avatar left-aligned on reload — 2026-07-30

Cause: before track width measure, `photoLeft` fell back to 0 → circle stuck left until ResizeObserver.

Fix:
- Photo: when tw unknown use `left:0; right:0; margin:auto` centering
- Sync localTrackW from trackWidth prop + root RO
- ProfileView heroTrack callback ref sets trackWidth on attach (before paint cycle when possible)

## FOUC: crushed action buttons on reload — 2026-07-30

Cause: parent `trackWidth` starts at 0; chrome width fell back to `photoSize` (96px), so grid-cols-2 buttons overlapped until ResizeObserver ran.

Fix in profile-photo-hero.tsx:
- Local `localTrackW` via root ResizeObserver
- When width unknown: chrome `width: 100%` (never 96px)
- Buttons `min-w-0` + grid `w-full`

## Expanded chrome placement fix — 2026-07-30

Bug: chromeTop fixed at 96+12 left name/buttons mid-photo; white text on light photo bg looked "behind" silhouette.

Fix in profile-photo-hero.tsx:
- chromeTop lerps from under-circle to `photoSize - chromeH - pads` (bottom overlay)
- z-index 30 + dark gradient under chrome for readable white text

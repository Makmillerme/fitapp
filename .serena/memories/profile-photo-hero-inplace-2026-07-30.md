Refactored profile photo expand to Telegram-like in-flow hero.

- Removed portal lightbox (`profile-photo-viewer.tsx` deleted).
- Added `ProfilePhotoHero`: circle↔square morph in page layout; expanded full-bleed aspect-square; bottom name/status overlay only (no top tint); kebab Make primary/Delete; swipeDown/tap expand, swipeUp collapse; horizontal snap carousel.
- ProfileView: `photoExpanded` state; action buttons stay under hero and are more compact (h-12 / text-xs); name row hidden when expanded.
- Crop upload unchanged.
- tsc + lints clean.
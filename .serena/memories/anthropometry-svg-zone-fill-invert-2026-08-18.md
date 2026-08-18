# Anthropometry zone fill (2026-08-18)

Selected muscle groups in `BodyMeasurementsCard` no longer use a stroked ellipse + duplicated `/skeleton.svg` image.

Implementation:
- New `src/components/clients/skeleton-figure.tsx` — inline path `d` from `public/skeleton.svg` (`SKELETON_VIEWBOX`, `SKELETON_PATH_D`, `SkeletonFigure({ fill, opacity, clipPath })`).
- Base layer: muted `SkeletonFigure` (`opacity 0.28`, `fill=currentColor` / `text-primary`).
- Selected layer: ellipse `clipPath` (`anthro-zone-${key}`) → primary `rect` underlay + white `SkeletonFigure` (inverted contours). Optional `scale(1.06)` around zone center. `transition-opacity duration-200`.
- Invisible hit ellipses and right-side ghost `Button` list unchanged. Height ruler and weight platform unchanged.
- `ZONES` tightened so the clip hugs the skeleton (neck/chest/waist/hips/biceps/thigh/calf).
- `public/skeleton.svg` kept as static asset, unused by the card.

True per-muscle anatomical paths are still not in the asset (one compound path).
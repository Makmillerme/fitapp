# Skeleton zone tap via HTML hit-test (2026-08-19)

SVG stays `pointer-events-none` so Base UI drawer still finds the HTML `touch-pan-y` wrapper and Progress tab can scroll. Muscle selection: pointerup on the wrapper (ignore if moved >8px) + `isPointInFill` on `[data-zone-hit]` paths. Restores tap-to-highlight without bringing back swipe-to-dismiss on SVG.

# Skeleton full-width, zone buttons overlay (2026-08-19)

`BodyMeasurementsCard`: figure SVG is `w-full h-auto` (viewBox aspect). Zone labels are `absolute right-2` overlay, not a flex sibling, so they no longer steal width and shrink the skeleton. Button column stops pointer propagation so taps don't also hit-test the figure.

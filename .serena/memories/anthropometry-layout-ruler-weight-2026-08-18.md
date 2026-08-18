# Anthropometry layout rewrite (2026-08-18)

`BodyMeasurementsCard` is now interactive (`"use client"`):
- Left: height ruler from skeleton head (y=82) to feet (y=955) with client `heightCm` (not in the body list).
- Center: muted skeleton; click a zone or a right-side row clips/fills that region in primary red and scales it ~12%.
- Right: neck/chest/waist/hips/biceps/thigh/calf — selected value grows.
- Under feet: weight ellipse/platform with `weightKg` from Contact.

SVG is a single path so true per-muscle fills are clip+overlay, not split paths.

Wired `weightKg` from `client-detail-view.tsx`.

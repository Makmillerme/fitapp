# Anthropometry: hide ruler/weight, center skeleton (2026-08-18)

In `BodyMeasurementsCard`:
- Height ruler (line + caps + cm badge) renders only when `heightCm != null`.
- Weight platform (ellipses + kg label) renders only when `weightKg != null`.
- Skeleton group translate: `-80` with ruler, `-132` without ruler so the figure is centered horizontally in the 760-wide viewBox (body center ~512).

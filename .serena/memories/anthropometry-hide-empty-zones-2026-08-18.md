# Anthropometry: hide empty values (2026-08-18)

`BodyMeasurementsCard` shows only filled data:
- Side list: `PARTS` filtered to `measurements[key] != null`. Empty zones are not listed and have no skeleton hit targets.
- Height badge on the ruler: hidden when `heightCm` is null (ruler ticks remain).
- Weight text on the platform: hidden when `weightKg` is null (platform ellipses remain).
- Dialog still lists all zone fields so the trainer can fill more later.
- Column layout: `justify-between` if more than 4 visible parts, otherwise `justify-start gap-1`.

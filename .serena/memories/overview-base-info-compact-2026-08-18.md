# Overview base info compact (2026-08-18)

In `client-detail-view.tsx` overview tab:
- Height and weight cells removed from «Базова інформація» (they live on Progress via BodyMeasurementsCard ruler/platform).
- Remaining fields (імʼя, телефон, вік, гендер) are a compact `dl` of label/value rows with `divide-y`, not 2-col muted tiles.
- Unused `fmtCm` / `fmtKg` helpers in this file were deleted.

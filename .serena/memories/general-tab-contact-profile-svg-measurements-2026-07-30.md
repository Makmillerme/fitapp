Implemented plan for General tab with Contact profile as source of truth.

Data model:
- `Contact` now stores general profile fields: `dateOfBirth`, `heightCm`, `weightKg`, `gender` (removed `age` idea; age derives from DOB).
- Added `Gender` enum.
- Added `ContactMeasurement` model for latest body metrics snapshots (`neck/chest/waist/hips/biceps/thigh/calf/height` + `measuredAt`).

Backend:
- `getClientDetail` now returns `latestMeasurement`.
- Added `upsertClientGeneral` action with validation for profile + measurements and duplicate phone guard.

UI:
- Reworked `Загальні` tab order: contraindications -> base info card -> SVG measurement card.
- Base info card displays name, phone, derived age, height, weight, gender.
- Added `BodyMeasurementsCard` component with responsive SVG layout, labels/measurement lines, red highlights, and double-ended vertical height arrow.
- Added `public/skeleton.svg` for rendering in the SVG card.

Integration:
- Updated `ClientCardDrawer` payload mapping for new profile and latest measurement fields.
- Simplified drawer/detail wiring (removed now-unused patch callbacks in drawer usage path).

Validation:
- Ran `npx prisma generate` and `npx tsc --noEmit -p tsconfig.json` successfully.

Implemented Telegram-like profile UX refactor with Contact-based attributes and inline tap-to-edit.

Completed:
- `Contact` schema extended with `about` and unique `tag`.
- Added `src/lib/actions/profile.ts`:
  - `getOrCreateMyContactProfile()`
  - `updateContactProfile()` with validations: phone, about length, tag format 3-24 [a-z0-9_], unique-tag check and user-facing conflict error.
- Updated `src/app/(trainer)/profile/page.tsx` to load profile via profile action and pass contact-centric data.
- Updated `TrainerProfile` type with `contactId`, `about`, `tag` and shared general fields.
- Rebuilt `ProfileView` to Telegram-like structure:
  - top avatar/name/status
  - action row with `Встановити фото` + `Налаштування` only
  - info rows (mobile/about/tag/birthday+age/gender/height/weight)
  - tap row -> shadcn Dialog editor per field
  - save updates via server action without page reload
  - duplicate tag handled with explicit error toast.

Validation:
- Typecheck and lints pass.

Pending user-confirmed operation:
- `prisma db push --accept-data-loss` was blocked by safety guard; requires explicit user consent before applying DB schema changes on remote Postgres host 91.239.232.91:6432.
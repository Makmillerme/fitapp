Polished trainer profile card to treat admin as a Contact with shared general attributes.

Changes:
- `src/app/(trainer)/profile/page.tsx` now resolves admin contact profile from `Contact` (by `trainerId` + telegram/phone), and auto-creates missing self-contact.
- `src/components/nav/trainer-menu-context.tsx` extended `TrainerProfile` with optional shared contact attributes: phone, dateOfBirth, heightCm, weightKg, gender.
- `src/components/profile/profile-view.tsx` redesigned UI:
  - hero card with avatar/name/username and badge `Контакт адміністратора`
  - dedicated `Загальні атрибути контакту` card with tiles: phone, gender, DOB, derived age, height, weight
  - DOB -> age derived on client side; empty values rendered as `—`
- Verified typecheck and lints are clean.

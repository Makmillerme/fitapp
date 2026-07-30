Refined profile data visibility/editing by client status.

Changes:
- Added `isClient` to `TrainerProfile` type and profile loader mapping.
- In `ProfileView`, height/weight rows are rendered only when `isClient=true`.
- Added UI guard in `openField` to prevent opening height/weight editors for non-clients.
- In `saveField`, height/weight payload is sent only for clients.
- In `updateContactProfile` server action, selected `isClient` and added hard validation:
  - reject updates containing `heightCm`/`weightKg` for non-client contacts.

Result:
- Contact profile now keeps general contact info only.
- Client-specific anthropometrics are status-gated while still stored on the same Contact entity for client contacts.
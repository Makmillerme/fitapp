## Phone validation + duplicate guard (2026-07-28)

- `src/lib/phone.ts`: `normalizePhone`, `isValidPhone`, `parsePhone`, `phoneDigits`.
  - UA: `050…` / `380…` → `+380…`; E.164 length 10–15; UA must be 12 digits with 380.
- `createContact` / `createClient`: Zod refine + store normalized `+…`; duplicate check by digit equality (so +380… and 050… collide).
- UI forms: disable submit until valid; inline error hint; placeholder `+380501234567`.

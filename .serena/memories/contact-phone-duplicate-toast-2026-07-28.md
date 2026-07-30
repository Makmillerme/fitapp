## Duplicate phone UX (2026-07-28)

- Constant `CONTACT_PHONE_EXISTS_MESSAGE` = «Даний контакт уже присутній у системі».
- `createContact` / `createClient`: digit-match duplicate → throw that message (no silent upgrade on createClient).
- Also map Prisma P2002 unique to same message.
- UI: `toast.warning` for this message, `toast.error` otherwise.
- To make contact a client: use «З контакту» tab.

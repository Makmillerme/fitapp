## Clients: promote contact + optional lastName (2026-07-28)

- Clients add dialog: tabs «З контакту» / «Новий». Pick promotes via `promoteContactToClient`; New creates Contact with isClient=true on same page.
- `eligibleContacts` = contacts where !isClient, passed from clients/page.
- `lastName` optional in `createClient`, `createContact`, and both UI forms (placeholder without *).

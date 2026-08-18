# Exclude trainer self from CRM (2026-07-30)

## Why
`getOrCreateMyContactProfile` stores trainer profile as a normal `Contact` (same trainerId + telegramId/phone). Lists/promote had no self-exclusion → could find/message/promote self as client.

## Fix
- Helper: `src/lib/contacts/self-contact.ts` — `excludeSelfContactWhere`, `assertNotSelfContact`, `assertPhoneNotTrainer`, `isSelfContact`
- `contact-messages.ts`: listContacts, conversations, createContact phone guard, assertOwnedContact rejects self (blocks chat)
- `clients.ts`: listClients, getClientCounts, getClientsPageData, getClientDetail, createClient phone guard, promoteContactToClient reject
- `profile.ts`: if self Contact had `isClient: true`, demote on profile load (repair)

No schema change.

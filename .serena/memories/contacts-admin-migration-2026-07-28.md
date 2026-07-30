## Contact model + ADMIN/USER migration (2026-07-28)

### Data
- `UserRole`: ADMIN | USER (was TRAINER | CLIENT). Wipe of CLIENT users + appointments/logs + old ClientConversation.
- New `Contact` (trainerId, name, phone, telegramId?, isClient, CRM fields).
- `Appointment`/`WorkoutLog`.clientId → Contact.
- `ContactConversation` / `ContactMessage` (sender ADMIN|CONTACT).
- User stripped of CRM fields (status/balance/goal/notes/trainerId).

### Auth/nav
- `requireRole("ADMIN")`, proxy, JWT, telegram auth → ADMIN/USER.
- Sidebar: Контакти (/contacts) first, Додатки, CRM (/schedule workspace), Профіль; Settings footer.
- Default login/home → `/contacts`.
- Removed `/chats`.

### UI/actions
- `contacts-view` + contacts list Dialog + add contact + ContactChatDialog.
- `clients.ts` on Contact where isClient=true; createClient upgrades plain contact by phone.
- `contact-messages.ts`; schedule/briefing/programs/AI use Contact.
- `dev-login` seeds Contacts (3 clients + 1 non-client).

### Note
Re-login required after role rename (old JWT with TRAINER invalid).
# Unified client notes (2026-08-19)

`ContactNote`: `kind` PROGRESS | GENERAL, `templateKey` nullable (`goal`, `contraindications`), `title`, `body`.

- Progress tab: free notes replace log-derived 1RM placeholder.
- Notes tab: seeded templates (not deletable) + free GENERAL notes.
- Seed via `ensureClientNoteTemplates` on `getClientDetail`, `createClient`, `promoteContactToClient`. Copies existing `Contact.goal` / `Contact.notes` into empty templates.
- Template save dual-writes `Contact.goal` / `Contact.notes` for briefing.
- Actions: `src/lib/actions/notes.ts`. Dialog: `client-note-dialog.tsx`.
- Migration SQL: `prisma/migrations/20260819120000_contact_note/` (partial unique on templateKey). Table applied with `db push`; Prisma `@@unique` not in schema because `db push --accept-data-loss` is blocked without user consent.

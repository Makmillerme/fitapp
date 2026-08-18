# Exclude self CRM filter NULL bug (2026-07-30)

## Incident
User reported all old contacts "gone". **Nothing was deleted** — DB still had 10 Contact rows.

## Cause
`excludeSelfContactWhere` used `NOT: { OR: [{ telegramId: trainerTg }, ...] }`.
In SQL, for contacts with `telegramId IS NULL`: `(NULL = tg) OR ...` → UNKNOWN → `NOT UNKNOWN` → row excluded. Effectively hid almost all CRM contacts.

Verified on fitapp: `bad_not_or_count=0`, `good_exclude_count=9` (of 10).

## Fix
`excludeSelfContactWhere` = AND of:
- `telegramId IS NULL OR telegramId <> trainerTg`
- if trainer has phone: `phone IS NULL OR phone <> trainerPhone`

File: `src/lib/contacts/self-contact.ts`

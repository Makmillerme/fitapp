## Audit 2026-08-19: unified client notes

Verified `/serena` + `/ui-add` + `/audit` after implementation.

### Correct
- ContactNote + ContactNoteKind in Prisma; table exists (db push already applied).
- Templates `goal` / `contraindications` seeded from `getClientDetail`, create, promote.
- Dual-write: `templateKey=goal` → Contact.goal; `contraindications` → Contact.notes. Dev log RETURNING includes templateKey then SET goal — mapping follows the saved row, not the body text.
- Progress is free PROGRESS notes (no 1RM / WorkoutLog grouping in UI).
- ClientNoteDialog: shadcn Dialog/Input/Textarea/Button/Label already in `src/components/ui/` — no new primitives, no RHF (matches measurement dialog; RHF not in package.json).
- Boundaries: `"use client"` views/dialog; `"use server"` actions. Dates ISO-serialized in drawer. No hydration issue found.
- Templates: title locked, delete blocked.

### Fixed in audit
- Progress empty state now has CTA «Додати запис» (Plus in header was already there).
- Dual-write uses else-if so goal and notes cannot both update in one save.

### Leftovers (need explicit OK)
- Partial unique index `ContactNote_contactId_templateKey_key` is in migration SQL but **not** in Prisma schema (`@@unique` was dropped to avoid `db push --accept-data-loss`). Live uniqueness is app-level only; Strict Mode double `getClientDetail` can duplicate templates.
- `getClientDetail` still loads WorkoutLog; UI no longer uses them.
- next-devtools MCP did not attach on port 3000 this session; tsc previously passed; notes upsert 200 in dev logs.

Do not run `prisma db push --accept-data-loss` without user yes. To lock templates: `CREATE UNIQUE INDEX ... WHERE templateKey IS NOT NULL` after checking no duplicate keys.

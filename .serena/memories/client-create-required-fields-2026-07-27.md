# Client create form — required fields (2026-07-27)

## Rule
New client card requires only: **firstName**, **lastName**, **phone**. Goal, balance, notes live on client detail card.

## Schema
- `User.phone String?` added in prisma; indexed with trainerId.

## Server
- `createClient` uses Zod schema; defaults sessionBalance=0, status=DEBT; duplicate phone per trainer rejected.
- Search includes phone.

## UI
- `ClientsView` dialog: 3 fields (Імʼя, Прізвище, Телефон).
- `ClientDetailView` shows phone in header subtitle.

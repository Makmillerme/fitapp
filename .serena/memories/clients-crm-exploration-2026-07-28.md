# Clients CRM exploration (2026-07-28)

## Architecture
Clients are `User` rows with `role: CLIENT` + `trainerId`, not a separate Prisma `Client` model.

## Routes
- `/clients` — list (`src/app/(trainer)/clients/page.tsx` → `ClientsView`)
- `/clients/[clientId]` — detail (`src/app/(trainer)/clients/[clientId]/page.tsx` → `ClientDetailView`)
- FAB: `/clients?action=add` opens create dialog via `useActionDialog`

## List card fields
Avatar (`photoUrl`), name (`firstName`+`lastName`), goal, sessionBalance (+ debt badge if status DEBT or balance ≤1). Status filter chips ACTIVE/DEBT/PAUSED.

## Create form
Required: firstName, lastName, phone. No goal on create. Synthetic telegramId=Date.now BigInt. status=DEBT, sessionBalance=0.

## Detail
Header: name, phone, goal, status. Balance adjust +10/+1/−1. Notes. Appointment history. Workout logs. No edit form for goal/phone/name yet.

## Messaging
No trainer↔client messaging. ChatThread/ChatMessage are AI-only. Telegram bot: `/start` + WebApp button only; no outbound client notifications.

## Schema drift
`prisma/schema.prisma` currently only HealthCheck; live shape in generated client + migration `20260724192000_domain_models` (+ phone added later per memory, present in generated User).
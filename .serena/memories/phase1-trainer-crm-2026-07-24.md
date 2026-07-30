# fitapp — Phase 1 implementation (2026-07-24)

## Done
Epic 1 (Foundation) + Epic 2 (Trainer TWA) implemented on Next.js 16 + Prisma 7 + Postgres (PostgressOps).

## Stack notes
- Telegram packages: switched from deprecated `@telegram-apps/*` to maintained `@tma.js/sdk-react@3.0.23` + `@tma.js/init-data-node@2.0.8`.
- Auth: jose JWT httpOnly cookie (`fitapp_session`), not Auth.js (v5 still beta).
- AI: openai@6.49.0; gracefully falls back to mock text when `OPENAI_API_KEY` empty.
- Redis deferred to Phase 3 (bot is stateless `/start` only).

## Key files
### Auth / bot
- `src/lib/auth/validate-init-data.ts`, `session.ts`, `current-user.ts`, `dev-login.ts`
- `src/app/api/auth/telegram/route.ts`
- `src/middleware.ts` — guards `/schedule|/clients|/programs|/ai`
- `src/lib/telegram/bot.ts`, `src/app/api/telegram/webhook/route.ts`
- `scripts/telegram-dev-polling.ts` (`npm run bot:dev`)
- `src/app/connect/page.tsx` — Telegram bridge + **Demo Trainer (dev)** login with seed data

### Data
- `prisma/schema.prisma` — User, Program, Exercise, ProgramExercise, Appointment, WorkoutLog + enums
- Applied via `db:push`; migration snapshot `20260724192000_domain_models`

### Trainer UI
- `src/app/(trainer)/layout.tsx` + `src/components/nav/bottom-nav.tsx`
- Schedule: `schedule/page.tsx` + `components/schedule/*` + timer + AI briefing drawer
- Clients: list + detail with balance top-up
- Programs: list + create + inline AI generate + detail
- AI Analysis: `/ai` weekly signals from live DB aggregates

### Theme
- Brand primary `#EB0029` (OKLCH), shadows `shadow-card|float|nav`, utilities in `globals.css`

## Env required
`DATABASE_URL`, `SESSION_SECRET`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_TRAINER_IDS`, `OPENAI_API_KEY`, `NEXT_PUBLIC_APP_URL`

## How to try locally
1. `npm run dev`
2. Open `/connect` → **Увійти як Demo Trainer (dev)**
3. Seeds clients (Максим/Олена/Дмитро), program, today's appointments, sample WorkoutLog

## Deferred (Phase 2/3)
Client TWA, booking, notifications/cron, Whisper voice log, Redis sessions, payments, advanced analytics.

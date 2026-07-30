# fitapp — UI mockup: Trainer Dashboard (2026-07-24)

## Source
User provided a static HTML/Tailwind CDN mockup (phone-frame demo) saved at:
`docs/code_artifact (1).html` (also copied to uploads folder). This is the visual reference ("сирий експлойт") for the trainer CRM's mobile UI — to be reimplemented on our stack (Next.js + shadcn + Tailwind v4), not copied as-is.

## What it shows
Mobile app (phone-frame) with bottom nav, 4 tabs:
1. **Розклад (Schedule)** — default/home tab. Horizontal date scroller (day pills), vertical timeline of sessions per day. Session card: client name, muscle group/workout type, duration+location badges, "Програма" + "Таймер" buttons, sparkle icon opens AI briefing sheet. "Додати запис" dashed button.
2. **Клієнти (Clients)** — search bar, filter chips (Активні/Боржники/Пауза with counts), client list cards: avatar/initial, name, goal, remaining sessions badge or payment-due warning (red left border + "ОПЛАТА" tag).
3. **Програми (Programs)** — "Створити вручну" / "Зібрати з ШІ" quick actions grid, program template cards (name, description, duration weeks, tags, "Деталі"/"Призначити" buttons).
4. **ШІ Аналіз (AI Analysis)** — weekly AI insight card (dark bg), 2-col metric grid (progress %, churn-risk count), "Сигнали ШІ" list per-client (warning/success variants, color-coded left border).

Plus overlays:
- **AI Briefing bottom sheet** (shadcn Drawer equivalent): triggered by sparkle icon on session card. Shows status, last-session notes, today's recommendations checklist, "Адаптувати програму" CTA.
- **Workout timer overlay** (full-screen): EMOM-style countdown, round counter, pulse animation, play/pause/reset/complete controls. Opened via "Таймер" button on session card.

## Design tokens (from mockup, non-final — to be adapted to our shadcn theme)
- Primary red: `#EB0029` (OnePlus-style accent), hover `#D00024`, light `#FFF0F2`
- Surface: `#F5F5F7`, foreground `#1F1F1F`, muted `#8E8E93`
- Rounded-3xl cards, soft shadows (`shadow-card`, `shadow-float`, `shadow-nav`)
- Icons: Phosphor Icons (CDN) in mockup — **our project uses lucide-react** (shadcn default), need icon mapping, not adding phosphor as new dependency.
- Font: Inter (mockup uses Google Fonts CDN; our project already uses Geist — decide whether to switch to Inter or keep Geist).

## Confirmed shadcn/ui pieces available in @shadcn registry (verified 2026-07-24)
drawer, tabs, card, avatar, badge, input, dialog, sheet — all present, no custom primitives needed.

## Decisions made so far (user answered AskQuestion)
- **Data layer:** Phase 1 = UI-first with static/mock data (arrays/fixtures), DB wiring (Prisma models Client/Session/Program) comes in a later phase.
- **Auth:** Will eventually be Telegram-bot-based authentication (per product vision — web app tied to Telegram bot). NOT a generic Auth.js/Better-Auth flow. For the initial UI phase, use a single-trainer stub (no login screen), but keep the door open for Telegram auth wiring later.
- User is about to share a **full detailed roadmap/plan** before we finalize implementation scope — do NOT start building yet, wait for that plan.

## Status
Waiting for user's full plan (they said "зачекай, я тобі геть увесь план покажу"). Next step: read that plan, then reconcile with this mockup analysis, then produce a CreatePlan for actual implementation.

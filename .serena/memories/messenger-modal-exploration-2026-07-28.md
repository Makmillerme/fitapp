# Messenger modal exploration (2026-07-28)

## AI chat UI (`src/components/ai/ai-chat-view.tsx`)
- Layout: `flex h-full min-h-0 flex-col` → header + scrollable list (`flex-1 overflow-y-auto hide-scrollbar px-4`) + composer (`shrink-0` textarea + round send).
- Bubbles: user `rounded-2xl rounded-br-md bg-primary text-white max-w-[88%]`; assistant `rounded-bl-md bg-white shadow-card`.
- Composer: `Textarea` `rounded-2xl border-gray-100 bg-white shadow-card` + `Button size=icon rounded-full shadow-float`.
- Threads/settings via `ChatSettingsSheet` (Sheet side=right).
- Streaming: POST `/api/ai/chat`, AbortController; AI-only persistence.

## Modal primitives
- Dialog (`@base-ui/react/dialog`) — forms (clients create, programs).
- Sheet — nav menu left, chat settings right; portals via `usePortalLayer`.
- Drawer — AI briefing, duration pickers; `DrawerContent max-h-[85%]`.
- `useActionDialog` for `?action=` deep links.

## Telegram
- grammY in `src/lib/telegram/bot.ts`: only `/start` + WebApp keyboard; `ctx.reply`. No sendMessage helper / outbound DM API.
- Webhook: `src/app/api/telegram/webhook/route.ts`. Polling: `scripts/telegram-dev-polling.ts`.

## Client ↔ Telegram
- `User.telegramId` UNIQUE BigInt. Manual clients get synthetic `Date.now()` id until bot join.
- Session JWT includes telegramId; `requireRole("TRAINER")` for CRM/AI.

## Prisma chat
- `ChatThread`/`ChatMessage` AI-only (trainerId). No trainer↔client conversation models.
- `schema.prisma` drift: file shows HealthCheck only; live domain in migration + DB push for Chat*.

## Gap for client messenger modal
Need new outbound `bot.api.sendMessage(telegramId, text)` helper + real (non-synthetic) telegram linkage check + optional Conversation model if storing history.
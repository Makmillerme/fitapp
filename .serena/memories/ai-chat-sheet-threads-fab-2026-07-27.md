# AI Chat UX — Sheet, threads, FAB morph (2026-07-27)

## Done
- Prisma: `ChatThread`, `ChatMessage`, enum `ChatMessageRole` (tables applied via pg client through PgBouncer; `db:push` failed on prepared statements).
- `src/lib/ai/models.ts` — CHAT_MODELS (`gpt-4o-mini`, `gpt-4o`), resolve/title helpers.
- `streamChat(messages, model)` dynamic model.
- `src/lib/actions/chat-threads.ts` — list/get/create/updateModel/delete.
- `POST /api/ai/chat` — threadId+model, persist user before stream, assistant after; headers `X-Thread-Id`, `X-Chat-Mock`.
- shadcn `sheet` + `label` installed.
- `ChatSettingsSheet` — model Select + thread list + new/delete.
- `AiChatView` — cleaned header (AI + settings only), no Enter hint / context texts; multi-thread without reload race during stream.
- `BottomNav` — on `/ai` FAB morphs to centered red dot (fixed 56px slot, size/opacity transitions).

## Default model
Still `gpt-4o-mini`.

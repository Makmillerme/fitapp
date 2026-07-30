# AI tab — ChatGPT-style chat (2026-07-27)

## Nav
- Label: "AI" (was "ШІ Аналіз")
- Icon: MessageCircle
- FAB still disabled on /ai

## UI (`src/components/ai/ai-chat-view.tsx`)
- Chat bubbles (user primary right, assistant white left)
- Empty state + 3 suggestion chips
- Fixed bottom composer (Textarea + send), Enter to send
- Typing indicator dots while pending

## Backend
- `src/lib/actions/ai-chat.ts`: `sendTrainerChatMessage`, `getTrainerChatBootstrap`
- System prompt includes trainer CRM context (client counts, names)
- Mock replies when OPENAI_API_KEY missing
- `generateChat` added to `src/lib/ai/openai.ts`

## Page
- `src/app/(trainer)/ai/page.tsx` replaces old analytics dashboard

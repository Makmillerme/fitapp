# AI chat streaming (2026-07-27)

## API
- `POST /api/ai/chat` — plain text stream (`text/plain`), trainer session required.
- OpenAI: `streamChat` async generator in `openai.ts`.
- Mock: word-by-word simulated stream when no OPENAI_API_KEY; header `X-Chat-Mock: 1`.

## Shared
- `src/lib/ai/trainer-chat.ts` — context, system prompt, mock reply, buildChatTurns.

## Client
- `AiChatView` uses fetch + ReadableStream; empty assistant bubble fills incrementally.
- Blinking cursor while streaming; dots only before first token.
- AbortController on new send.

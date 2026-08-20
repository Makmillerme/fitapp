# Mobile bugs + chat cache (2026-08-19)

Implemented without Pusher/WebSocket.

1. **AI sticky scroll** — `AiChatView` autoscrolls only when `pinToBottomRef` (near bottom ≤80px or after send/new/load). `onScroll` updates the pin.
2. **Profile PTR** — `overscroll-y-none` on `TrainerAppShell` + profile scroller. Non-passive `touchmove` + `preventDefault` while `axisLock === "v"`.
3. **AI tab flash** — `src/app/(trainer)/loading.tsx` solid `#FAFAFA`.
4. **Pencil** — `leading-none` on name + `-translate-y-px self-center` on edit button.
5. **Set photo** — file input `sr-only` instead of `hidden` so Android Chrome `click()` works.
6. **Cache** — module stores: `src/lib/ai/ai-chat-session-cache.ts` (threads + messagesByThread), `src/lib/contacts/contact-chat-session-cache.ts`. Remount/reopen shows last snapshot, then silent refetch.

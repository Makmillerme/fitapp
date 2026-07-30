## AI tab flicker fix (2026-07-27)

**Cause:** `/ai` SSR only loaded thread list; `AiChatView` mounted with `messages=[]`, showed empty-state (suggestions), then `useEffect` called `getThreadMessages` → content popped in (flash).

**Fix:**
- `ai/page.tsx` prefetches active thread messages via `getThreadMessages`
- Passes `initialMessages` + `initialThreadId` to `AiChatView`
- Removed client bootstrap `useEffect` reload on mount
- Switching threads still uses `loadThread` with pulse skeleton instead of empty-state flash
- Trainer layout Suspense fallback: solid `#FAFAFA` instead of `null`
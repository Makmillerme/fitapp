## Clients CRM turbo MVP (2026-07-28)

### Card list
- `clients-view.tsx`: avatar + name + `Залишок N занять` (goal removed from secondary line); debt badge inline.
- Right actions outside Link (a11y): Call (`tel:`) + Write (opens chat). Both `size-icon` / `h-8`.
- `phone` added to `ClientListItem` and mapped in `clients/page.tsx`.

### Messenger (UI + DB only, no Telegram)
- Prisma: restored full schema from DB pull + cleaned relations; added `ClientConversation`, `ClientMessage`, enum `ClientMessageSender` (TRAINER|CLIENT).
- Applied via `prisma db push` + `prisma generate`.
- Actions: `src/lib/actions/client-messages.ts` — getOrCreate, list, send (trainer-only, ownership check).
- UI: `client-chat-dialog.tsx` — Dialog chat column like AI (bubbles + composer); footnote about future TG sync.

### Out of scope (next)
- Telegram send/receive, client Mini App chat UI, detail page redesign.

### Verify
- `npx tsc --noEmit` OK.
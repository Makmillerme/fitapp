## Sidebar Чати tab (2026-07-28)

Added app-level sidebar item **Чати** between Додатки and Профіль.

- `SIDEBAR_ROUTES.chats = "/chats"` + protected prefix + `proxy.ts` matcher
- `trainer-menu-drawer.tsx` — MessagesSquare icon link
- Page: `src/app/(trainer)/chats/page.tsx` + `ChatsView` list of `ClientConversation` with preview; opens existing `ClientChatDialog`
- Action: `listClientConversations()`; `sendClientMessage` also revalidates `/chats`
- No bottom nav on `/chats` (app-level route, like Apps/Profile)
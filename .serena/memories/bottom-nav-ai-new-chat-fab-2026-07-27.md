## Bottom nav FAB on /ai (2026-07-27)

**Structure:** Same elevated red FAB (`size-14`, `-top-5`, `shadow-float`) on all trainer tabs.

| Tab | FAB action | href | Icon |
|-----|------------|------|------|
| Schedule / Clients / Programs | Add item | `?action=add` | Plus |
| AI | New chat | `/ai?action=new` | MessageSquarePlus |

**File:** `src/components/nav/bottom-nav.tsx`
- `getCenterAction()` returns context-specific href/label/icon
- `CenterFab` — standard primary FAB for all routes (no morph/dot/ring)
- Removed custom `NewChatFabIcon` composite; uses Lucide `MessageSquarePlus`

**AI integration:** `AiChatView` uses `useActionDialog("new")` → `handleNewChat()` on FAB press. Thread history remains in settings Sheet (gear icon).
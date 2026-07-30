## Client card shell mockup (2026-07-28)

Redesigned `/clients/[id]` (`client-detail-view.tsx`) to match provided mockups:
- Header: avatar, name, goal/status meta, Send → ContactChatDialog
- Tabs: Огляд | Прогрес | Історія | **Нотатки** (AI tab removed)
- Overview: contraindications block (uses `notes` temporarily), session balance + Списати −1, latest program/WOD card
- Progress: strength preview from workout logs (placeholder until attributes defined)
- History: appointment timeline
- Notes: read-only `client.notes` for now

User will specify per-tab attributes next.

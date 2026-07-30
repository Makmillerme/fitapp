## Trainer menu drawer simplified (2026-07-27)

Removed two-column layout (left icon rail + right content panel). Drawer is now single-column:
- Profile card at top
- **Головна** section: links to /schedule, /clients, /programs, /ai (active state via pathname)
- Footer: Налаштування (stub) + Вийти

Removed: Додатки section, TrainerMenuSection state, openSection(). Context: open/setOpen/openMenu only.

`TrainerHeader` hamburger calls `openMenu()`.
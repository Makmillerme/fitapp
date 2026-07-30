## Sidebar app-level navigation (2026-07-27)

**Problem:** Sidebar wrongly listed workspace tabs (Розклад/Клієнти/Програми/AI) under "ГОЛОВНА".

**Solution:** Two-level nav architecture:
- **Sidebar (app-level):** Головна → `/schedule` (active on workspace routes), Додатки → `/apps`, Профіль → `/profile`, Налаштування → `/settings` (footer)
- **Bottom nav:** only on workspace routes (`/schedule`, `/clients`, `/programs`, `/ai`)

**Files:**
- `src/lib/nav/trainer-routes.ts` — `WORKSPACE_ROUTES`, `isWorkspaceRoute`, `SIDEBAR_ROUTES`, `isTrainerProtectedRoute`
- `src/components/nav/trainer-shell.tsx` — conditional BottomNav + TrainerMenuDrawer
- `src/components/nav/trainer-menu-drawer.tsx` — 3 main links + settings footer + logout
- `src/app/(trainer)/apps|profile|settings/page.tsx` + views in `components/apps|profile|settings`
- `src/middleware.ts` — protects new routes
- `src/app/(trainer)/layout.tsx` — uses TrainerShell

**Apps page:** launcher grid to workspace modules (not in sidebar).
**Default home:** connect flow → `/schedule`; Головна in sidebar active on any workspace route.
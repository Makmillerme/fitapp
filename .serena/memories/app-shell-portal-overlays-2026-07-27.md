## Mobile app shell portals (2026-07-27)

**Problem:** Sheet/Dialog/Drawer/Select portaled to `document.body` with `position: fixed` → overlays appeared outside the 430px trainer shell in desktop/mobile emulation.

**Solution:**
- `src/components/app-shell/trainer-app-shell.tsx` — wraps trainer layout, `[transform:translateZ(0)]` scopes `fixed` to shell, portal mount `data-app-shell-portal` at end of shell
- `useAppShellPortal()` / `usePortalLayer()` — context for portal `container`
- `src/app/(trainer)/layout.tsx` — uses `TrainerAppShell`
- Updated `sheet.tsx`, `dialog.tsx`, `drawer.tsx`, `select.tsx` — pass `container` to Base UI Portal

Overlays now render inside the phone frame, not the full browser viewport.
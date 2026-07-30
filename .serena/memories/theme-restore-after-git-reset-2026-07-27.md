## Theme restore after git reset (2026-07-27)

`git reset --hard` reverted tracked `src/app/globals.css` to default shadcn grayscale (primary = near-black).

**Restored in globals.css:**
- Brand primary `#EB0029` → `oklch(0.55 0.24 25)` (light), `oklch(0.58 0.24 25)` (dark)
- Muted foreground tuned for mockup
- Custom shadows: `shadow-card`, `shadow-float` (red glow), `shadow-nav`
- Utilities: `hide-scrollbar`, `pb-safe`, `timer-pulse` animation
- Body bg `#FAFAFA`

**Also restored:** `layout.tsx` dev outer bg `#E4E4E7` + `suppressHydrationWarning` on html.

UI components use `text-primary`, `bg-primary`, `shadow-float` — all depend on this file.
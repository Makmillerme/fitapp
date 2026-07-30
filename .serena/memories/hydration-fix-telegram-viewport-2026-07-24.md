# Hydration fix — Telegram Web App viewport (2026-07-24)

## Problem
React hydration mismatch on `<html>`: Telegram `telegram-web-app.js` injects `--tg-viewport-height` and `--tg-viewport-stable-height` CSS vars on the client; SSR HTML has no such `style`.

## Fix (src/app/layout.tsx)
1. `suppressHydrationWarning` on `<html>` — expected for third-party TWA SDK DOM mutations.
2. Script strategy changed from `beforeInteractive` → `afterInteractive` so SDK runs after React hydration.

## Notes
- Global script remains in root layout for all trainer TWA routes.
- Dev browser (non-Telegram) still loads SDK with default 100vh vars; suppressHydrationWarning handles that.

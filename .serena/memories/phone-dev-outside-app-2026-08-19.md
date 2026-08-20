# Phone preview outside the app (2026-08-19)

User wants Android Chrome testing until public release. Must **not** live in the Next.js app (`package.json`, `next.config.ts`, `src/`).

Implemented as Cursor tooling only:
- Slash command: `.cursor/commands/phone-dev.md` (`/phone-dev`)
- Script: `.cursor/scripts/phone-dev.ps1` — `adb reverse tcp:3000 tcp:3000`
- Rule: `.cursor/rules/phone-dev-not-in-app.mdc`

Not an MCP server: ADB reverse is a one-shot system command, not a long-running tool server.

Usage: USB debugging on, cable connected, `npm run dev` already running, then the ps1 script. Phone Chrome: `http://localhost:3000`, Demo Admin on `/connect`.

# fitapp — conventions

## Code editing
- Use **Serena MCP** for app code; standard editor tools for `.cursor/` only.
- Activate project: `d:\Project\myprog\fitapp` before edits.

## UI
- **Shadcn First** — no custom primitives; install from registry via shadcn MCP.
- Layouts: Tailwind flex/grid only; avoid absolute positioning unless required.

## Backend
- Ask user: Prisma vs Payload for new modules.
- Prisma migrations require explicit approval.

## Language
- User-facing assistant responses: Ukrainian.
- Code/comments: match surrounding codebase (English typical for code).

## Backlog
Deferred ideas → `docs/backlog/ideas.md` per `.cursor/rules/backlog.mdc`.

## GitHub
Public repos only via MCP; create `Makmillerme/fitapp` when ready to push.

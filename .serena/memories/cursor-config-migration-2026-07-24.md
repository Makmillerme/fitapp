# fitapp — cursor config migration (2026-07-24)

Migrated `.cursor/` from mtrucklending to fitapp:

- Updated Serena paths: `d:\Project\myprog\fitapp`, project name `fitapp`
- Updated rules: serena-editing, senior-agent-workflow, ukrainian-wrong-keyboard-layout, github-mcp-public-repos-only
- Updated commands: serena, uk-layout, PostgresOps example
- Rewrote MCP_SETUP.md for fitapp
- Removed `.cursor/tmp-mcp-push/` (old mtruck deploy artifacts) and debug logs
- Created `docs/backlog/ideas.md`
- Serena onboarding memories: core, tech_stack, suggested_commands, conventions, task_completion

Global MCP config remains in `~/.cursor/mcp.json` (filesystem already includes `D:\Project\`).

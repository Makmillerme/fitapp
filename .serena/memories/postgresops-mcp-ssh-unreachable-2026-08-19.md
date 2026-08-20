## PostgresOps check attempt 2026-08-19

User asked MCP health check. Result:
- `user-postgres-ops` MCP: **FAIL** — all tools timeout (`Timed out waiting for connection`, `mcp_auth` rejected 30s). MCP runs via SSH `root@91.239.232.91` → `node src/index.js` in `/root/apps/PostgressOps/tools/mcp-postgres-ops`.
- Direct SSH from dev machine: **FAIL** — `Connection timed out` on port 22 (banner exchange).
- Local PgBouncer probe `:6432/fitapp`: **FAIL** — `08P01 server_login_retry` (PgBouncer reachable but cannot login to PostgreSQL backend).

Conclusion: cannot operate stack remotely until SSH works OR postgres backend is restored on server. App 500 is server-side.

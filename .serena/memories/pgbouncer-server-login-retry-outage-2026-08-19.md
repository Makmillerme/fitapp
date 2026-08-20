## server_login_retry outage (2026-08-19)

Runtime probe (`tmp-db-probe.cjs`) against `91.239.232.91:6432/fitapp` consistently returns `08P01 server login has been failing, try again later (server_login_retry)`. Direct `:5432` → `ECONNREFUSED` (not exposed; only PgBouncer path).

This is **PgBouncer → PostgreSQL backend login failure**, not app credentials or UI code. postgres-ops MCP was `Not connected` during incident.

App mitigations in `src/lib/prisma.ts`:
- dev pool `max: 1`
- `withPgRetry()` up to 5 attempts, pool reset + 1s/2s/… backoff
- `getCurrentUser` uses React `cache()` + `withPgRetry`

**Server fix required:** on PostgressOps host run `bash scripts/healthcheck.sh`; if postgres down, `bash scripts/reinstall.sh` or restart containers. Reload pgbouncer after postgres is healthy.

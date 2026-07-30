# fitapp — database setup (2026-07-24)

## PostgressOps (remote server 91.239.232.91)
- DB: `fitapp`
- User: `fitapp`
- Port: **6432** (PgBouncer, verified reachable)
- Provisioned via `run_provision_db`

## Prisma
- Version: 7.9.0 (stable)
- Generator: `prisma-client` → `src/generated/prisma` (gitignored, `postinstall` generates)
- Adapter: `@prisma/adapter-pg` + `pg` (Prisma 7 requirement)
- Client singleton: `src/lib/prisma.ts`
- Baseline model: `HealthCheck` (connectivity check; remove/replace later)
- Migration: `20260724180000_init` (marked applied; `migrate dev` needs shadow DB — use `db:push` or admin shadow DB for future dev migrations)

## Env
- `.env` — local secrets (gitignored)
- `.env.example` — template without password
- Password `+` must be URL-encoded as `%2B` in DATABASE_URL

## Git
- Local repo initialized, branch `main`, initial commit done
- GitHub MCP failed: **Bad credentials** — refresh `GITHUB_PERSONAL_ACCESS_TOKEN` in `~/.cursor/mcp.json`, then create public repo `Makmillerme/fitapp` and push

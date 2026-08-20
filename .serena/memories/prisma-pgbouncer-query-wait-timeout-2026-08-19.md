## Prisma + PgBouncer query_wait_timeout (2026-08-19)

Symptom: Next.js 500, Prisma P2039 / 08P01 `query_wait_timeout`, `timeout exceeded when trying to connect`. Hits `getCurrentUser` → `prisma.user.findUnique` in trainer layout. Pages already slow (GET /clients 13s) then pool wait times out.

Cause: `src/lib/prisma.ts` recreated a new PrismaClient on every HMR in development (workaround for stale DMMF after generate). Combined with remote PgBouncer on 6432 this saturates `query_wait_timeout`. postgres-ops MCP was Not connected during this incident.

Fix: singleton PrismaClient + shared Pool in all envs (`max: 2` in dev). Drop query logs in dev (error/warn only). After `prisma generate`, restart `npm run dev` if fields are missing.

If timeouts persist after restart: PgBouncer pool still full — wait ~30s or reload pgbouncer on the server.

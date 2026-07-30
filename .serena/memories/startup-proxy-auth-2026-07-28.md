# Startup flow + proxy migration (2026-07-28)

- Migrated deprecated `middleware` convention to Next.js 16 `proxy` by replacing `src/middleware.ts` with `src/proxy.ts` using the same auth guard logic for trainer-protected routes.
- Updated `src/app/page.tsx` to stop showing the placeholder landing screen and instead:
  - redirect unauthenticated users to `/connect`,
  - redirect authenticated trainers to `/schedule`.
- Added lightweight probe endpoints to eliminate noisy local 404 logs from MCP/OAuth discovery probes:
  - `src/app/api/plugin/mcp/route.ts`
  - `src/app/.well-known/oauth-protected-resource/route.ts`
  - `src/app/.well-known/oauth-protected-resource/api/plugin/mcp/route.ts`
  - `src/app/.well-known/oauth-authorization-server/route.ts`
- Verified with `npm run typecheck` and no linter issues on changed files.

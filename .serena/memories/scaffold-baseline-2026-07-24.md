# fitapp — scaffold baseline (2026-07-24)

## Done
- Next.js 16.2.11 + React 19 + Tailwind 4 + shadcn init
- Minimal home page (RSC, no use client)
- Root layout: uk lang, Geist fonts with --font-sans mapping, FitApp metadata
- lint + typecheck + build: all pass

## Audit notes
- No hydration risks on home (static server component)
- npm audit shows 6 transitive vulns (postcss/sharp/hono via next/shadcn CLI) — no safe fix without breaking downgrades; monitor upstream
- next-devtools MCP requires running dev server for runtime tools

## Removed
- create-next-app demo assets (next.svg, vercel.svg, etc.)

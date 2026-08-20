# API routes 404 via proxy (2026-08-19)

`POST /api/ai/chat` (and all `src/app/api/**` Route Handlers) returned the HTML 404 page. Files existed and were in `app-paths-manifest.json`.

Cause: Next.js 16 `src/proxy.ts` (compiled as middleware). Matcher `/ai/:path*` plus Turbopack `middleware-manifest.json` with empty `middleware: {}` meant Proxy still ran on `/api/*`. `NextResponse.next()` from Proxy then failed to hit the App Route Handler.

Fix: matcher `' /((?!api|_next/static|_next/image|_next/webpack-hmr|favicon.ico).*)'` so `/api` never enters Proxy. After the change: `GET /api/plugin/mcp` 200, `POST /api/ai/chat` 401 without session (handler reached).

`POST /api/pusher/auth` is not in this repo (browser/extension probe). Not adding Pusher.

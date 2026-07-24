# fitapp — tech stack (installed)

Scaffolded 2026-07-24:

| Package | Version | Notes |
|---------|---------|-------|
| next | 16.2.11 | stable latest |
| react / react-dom | 19.2.4 | stable |
| tailwindcss | ^4 | via @tailwindcss/postcss |
| typescript | ^5 | strict |
| shadcn | ^4.14.1 | base-nova preset, css variables |
| clsx, tailwind-merge, cva | latest stable | via shadcn init |
| lucide-react | ^1.26.0 | icon library |
| @base-ui/react | ^1.6.0 | shadcn button primitive |

## Scripts
- `npm run dev` — next dev --turbopack
- `npm run build` — production build (verified OK)
- `npm run lint` — eslint
- `npm run typecheck` — tsc --noEmit

## Structure
- `src/app/` — App Router
- `src/components/ui/` — shadcn components (button installed)
- `src/lib/utils.ts` — cn() helper
- `components.json` — shadcn config

## Pending (future phases)
- Prisma + PostgreSQL
- Telegram bot + Mini App
- Auth strategy TBD

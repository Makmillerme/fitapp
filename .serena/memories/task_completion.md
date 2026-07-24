# fitapp — task completion checklist

After substantive code changes (once app exists):

1. `npm run lint` — no new errors
2. `npx tsc --noEmit` — types pass (if configured)
3. `npm run build` — production build succeeds for non-trivial UI/routing changes
4. Update Serena memory via `write_memory` for significant features/fixes
5. Do **not** run `npm run dev` unless user requested

For `.cursor/` config-only changes:
- Verify path references point to `d:\Project\myprog\fitapp`
- Confirm Serena `activate_project` works for `fitapp`

For Prisma schema changes:
- Present migration plan; wait for user OK before migrate/db push.

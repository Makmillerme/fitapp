# Anthropometry persistence + stale Prisma client (2026-08-18)

Each save in `upsertClientGeneral` does `contactMeasurement.create` — a new snapshot row, not an update. History lives in `ContactMeasurement`. Latest for the card: `findFirst` `orderBy: measuredAt desc, id desc`.

DB columns `shoulderCm` / `forearmCm` exist on `fitapp.ContactMeasurement` (db push). Generated client in `src/generated/prisma` includes those fields.

Error `Unknown argument shoulderCm` was a **stale PrismaClient singleton** in running `npm run dev` (globalThis cache from before `prisma generate`). `src/lib/prisma.ts` now recreates the client on module load in development so HMR after generate does not keep the old DMMF.

If the error persists: restart `npm run dev`.

Reduced duplicate /clients DB queries by consolidating page data loading.

Changes:
- Added `getClientsPageData()` in `src/lib/actions/clients.ts` that calls `requireRole("ADMIN")` once and fetches clients, contacts, and counts in one Promise.all.
- Updated `src/app/(trainer)/clients/page.tsx` to use `getClientsPageData()` instead of calling `listClients`, `getClientCounts`, and `listContacts` separately.

Why:
- Previous implementation invoked `requireRole` in multiple server actions for a single page load, causing repeated `User` SELECT queries.
- Consolidation lowers redundant auth/db calls and should reduce noisy Prisma logs for `/clients`.
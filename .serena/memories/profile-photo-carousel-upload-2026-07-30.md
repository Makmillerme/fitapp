Implemented profile photo upload + Telegram-like fullscreen carousel.

Schema:
- Added `ContactPhoto` (id, contactId, url, sortOrder) with unique(contactId, sortOrder)
- Kept denormalized `Contact.photoUrl` as primary (sortOrder 0)
- db push applied; `public/uploads` gitignored

Server (`src/lib/actions/profile-photos.ts`):
- uploadContactPhoto: FormData, max 3, sharp resize max 1280 + webp q80, store under public/uploads/contacts/{id}/
- setPrimaryContactPhoto / deleteContactPhoto with reindex + photoUrl sync
- ensureContactPhotosMigrated: seeds ContactPhoto from legacy photoUrl

Client:
- compressImageForUpload (canvas ~1600px jpeg 0.82) before upload
- ProfileView: Set photo -> file input; avatar opens viewer; local photos state
- ProfilePhotoViewer: fullscreen portal, swipe/snap carousel, counter, kebab Make primary / Delete
- shadcn dropdown-menu added; sharp dependency installed
- Restored missing deps (date-fns, sonner, zod, etc.) after npm prune side-effect

Validation: tsc clean for feature files; lints clean.
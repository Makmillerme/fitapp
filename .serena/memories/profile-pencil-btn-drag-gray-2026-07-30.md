# Profile hero pencil + button gray-on-drag (2026-07-30)

## Fixes
1. Edit-name pencil no longer fades out on expand (`opacity: 1 - p*1.6` removed). Stays visible; color follows `mutedColor` (white-ish when expanded).
2. "Встановити фото" went gray while dragging because `disabled={!interactive}` → shadcn `disabled:opacity-50`. Now `disabled` only for upload/pending; drag blocks via `pointer-events-none` / parent chrome.

File: `src/components/profile/profile-photo-hero.tsx`

## Unified input/button heights (2026-07-28)

User requirement clarified:
- Reference height is the client search input (`h-8`, 32px).
- All text/search inputs should align to that height.
- AI tab composer input remains exception.
- Buttons should match input height.

Implemented:
1) `src/components/ui/button.tsx`
- Unified all button size variants to 32px height (`h-8` / `size-8`): `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.

2) `src/components/ui/dialog.tsx`
- Updated `DialogFooter` mobile button sizing to `h-8` and full width, removing previous temporary `h-11` override.

Notes:
- Shared `Input` primitive already uses `h-8`.
- AI chat composer uses `Textarea` with custom sizing and was intentionally left unchanged as requested.

Verification:
- `npx tsc --noEmit` passed.
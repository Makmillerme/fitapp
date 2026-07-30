# Profile hero: compact collapse + bottom-pinned chrome (2026-07-30)

## UX
- **Collapsed (p=0):** circle 96 + PHOTO_GAP 12 + chromeH — normal spacing under circle (not full square gap)
- **Expanded (p=1):** container = trackWidth square; chrome still `bottom: 0` overlay
- Photo lerps 96→fullSize / radius; chrome does **not** follow photoSize (only rides container bottom as height lerps)

## Math
- `collapsedH = 96 + 12 + chromeH` (chromeH from ResizeObserver on inner chrome)
- `containerH = lerp(collapsedH, max(collapsedH, fullSize), p)`
- Chrome: `absolute inset-x-0 bottom-0` + pad lerp

## File
`src/components/profile/profile-photo-hero.tsx`

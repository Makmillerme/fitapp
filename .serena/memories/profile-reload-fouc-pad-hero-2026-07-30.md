# ProfilePhotoHero overlap + FOUC (2026-07-30)

## Overlap bug
In-flow chrome with `marginTop: 108` + absolute photo caused **margin collapse** through the relative root → chrome sat at y=0 under the circle (name through photo).

## Fix
- Reverted to always-absolute chrome (`top: chromeTop`)
- Always `height: containerH`
- Kept constant `collapsedHeaderH = 84` scroll pad (no header measure FOUC)
- `chromeH` initial 122; ResizeObserver only updates when value changes

Do **not** use marginTop on in-flow chrome next to absolute photo without padding/overflow on the parent.

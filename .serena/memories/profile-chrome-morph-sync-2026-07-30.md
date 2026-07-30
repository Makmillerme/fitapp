# Profile chrome morph polish — sync with photo (2026-07-30)

## Bugs fixed
- Buttons lagged badly: shadcn `Button`/`buttonVariants` use `transition-all`, so bg/border chased progress with CSS easing → felt delayed vs finger-follow photo.
- Name/status snapped center→left at `p≥0.45` / `textAlign` at `p<0.35`.

## Fix (`profile-photo-hero.tsx`)
- `transition-none` on hero buttons + pencil
- Continuous flex spacers (`flexGrow: 1-p`) for name/status center→left
- `fgMix` without Math.round; button shadow opacity lerps with `p`
- Removed stepped `textAlign` on chrome wrapper

Layout/gesture (bottom-pin + compact collapse) unchanged.

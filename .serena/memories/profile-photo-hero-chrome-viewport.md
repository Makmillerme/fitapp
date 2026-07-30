# ProfilePhotoHero — chrome positioning (reverted 2026-07-30)

## Status
User rejected the `padLift` / viewport-fixed chrome attempt as "horribly buggy". **Reverted** to previous better state:

- `chromeTop` lerps under circle → bottom of square (`photoSize - chromeH - pads`)
- No `padLift` prop
- `ringOpacity = 1 - p`
- Scrim: 170% band + mask
- `scrollPadTop` still collapses in ProfileView (`headerHeight+12 → 0`)

## Open UX tension
User still wants chrome not to "stick/jump with photo", but Telegram-style bottom overlay *requires* chrome `top` to follow photo size. Next attempt must not use padLift compensation; need clearer product choice or different layering (chrome outside photo transform tree).
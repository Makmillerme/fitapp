## Fixed chrome + frosted scrim + aria-hidden — 2026-07-30

1. aria-hidden warning: removed aria-hidden from expand button; blur() when disabled; tabIndex/pointer-events only.
2. Chrome no longer lerps down onto photo bottom / slides width — fixed `top = 96+12`, full width; photo grows underneath; only textAlign + colors/opacity morph.
3. Scrim: frosted `backdrop-filter: blur` + soft translucent gradient (not flat black).

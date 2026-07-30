## SmartTimer brand polish (2026-07-27)

**Dial scale fix:** `TimerDial` uses `elapsedMs` + `elapsedToDialAngles()` — seconds needle = (elapsed%60)/60*360 (20s work → mark 20, not full circle). Minutes sub-dial is functional (0–30 min scale).

**Prep:** `PREP_SECONDS=10` before AMRAP/Tabata; large countdown UI; tap to skip (`skipPrep`).

**Brand UI:** ModeHub = FitApp white cards + primary icons (no SmartWOD rainbow pills). ConfigShell/AMRAP/Tabata CTAs and borders use `primary` / `shadow-float` / `#FAFAFA`.

**Files:** timer-dial.tsx, format.ts, smart-timer-types.ts, use-amrap-timer.ts, use-tabata-timer.ts, mode-hub.tsx, config-shell.tsx, amrap-view.tsx, tabata-view.tsx.
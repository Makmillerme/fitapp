## TimerDial OnePlus polish + hydration (2026-07-27)

**Hydration fix:** Module-level `DIAL_TICKS`, `DIAL_LABELS`, `SUB_TICKS`, `SUB_LABELS` with `r3()` (3-decimal) coords via `polar()` — no per-render Math.cos float drift SSR vs client.

**OnePlus visual:** overflow-hidden face; thinner needle; readout upper half MM black + SS,CS primary with comma; sub-dial labels 5–30; narrower center hit area.

**formatStopwatchParts(ms)** in format.ts for centiseconds.

**AMRAP lap:** Flag button (muted circle) replaces Plus; label «коло N».

**displayMs** passed from AMRAP/Tabata run phases for live ss,cs readout.
## TimerDial UX fixes (2026-07-27)

**Issues fixed:**
1. Digital readout moved **below** dial (`readoutPlacement="below"`) — no overlap with scale ticks.
2. Minutes sub-dial enlarged (r=22, labels 5–30 readable).
3. Prep: needle frozen (`elapsedMs=0` while isInPrep).
4. AMRAP Flag was overlapping dial / hard to tap — moved to `TimerRunControls` row below dial with z-safe layout: Flag | Pause/Play | Reset (OnePlus-style).
5. Flag only on AMRAP (`showLap`); Tabata has Pause/Reset + skip phase, no flag.

**Files:** timer-dial.tsx, timer-run-controls.tsx, amrap-view.tsx, tabata-view.tsx
## SmartTimer AMRAP + Tabata (2026-07-27)

**Flow:** `/apps` → SmartTimer → mode hub → AMRAP/Tabata config → run.

**Routes:**
- `/apps/smart-timer` — ModeHub (AMRAP, Tabata live; EMOM/For Time stubs)
- `/apps/smart-timer/amrap`
- `/apps/smart-timer/tabata`

**UI:** Light analog `TimerDial` (SVG ticks, red/teal needle, digital readout), `DurationPicker` (Drawer + ScrollArea), `ConfigShell`.

**Hooks:** `use-amrap-timer` (rAF + performance.now countdown, manual rounds++), `use-tabata-timer` (work/rest phases).

**Persist:** `fitapp:smart-timer:amrap` / `:tabata` in localStorage.

**Registry:** `WIDGET_APPS` → smart-timer only. Removed old interval-timer-view, use-interval-timer, duration-field, interval-config.

**shadcn:** added `scroll-area`. WorkoutTimer on schedule untouched.
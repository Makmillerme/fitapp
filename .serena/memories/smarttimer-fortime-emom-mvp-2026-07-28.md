Implemented SmartTimer MVP modes For Time and EMOM with existing brand UI.

Changes:
- Enabled mode hub links for `/apps/smart-timer/for-time` and `/apps/smart-timer/emom`.
- Extended smart timer config types/storage in `smart-timer-types.ts`:
  - ForTimeConfig { capEnabled, capSeconds }
  - EmomConfig { intervalSeconds, durationSeconds }
  - load/save/normalize for both localStorage keys.
- Added hooks:
  - `use-for-time-timer.ts`: prep -> stopwatch up, optional cap stop, lap capture list.
  - `use-emom-timer.ts`: prep -> running with total duration, interval cadence metadata (currentRound/totalRounds/nextIntervalInSeconds).
- Added views/pages:
  - `for-time-view.tsx` + page route
  - `emom-view.tsx` + page route
- Reused existing shared UI components (`ConfigShell`, `DurationPicker`, `TimerDial`, `TimerRunControls`) and no new primitive components.
- Typecheck passes.
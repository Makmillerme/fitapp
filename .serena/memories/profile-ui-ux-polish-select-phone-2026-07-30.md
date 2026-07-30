Polished Telegram-like profile UI/UX and fixed select control issue.

Changes in `src/components/profile/profile-view.tsx`:
- Moved name editing to icon button next to profile name (removed bottom 'Змінити імʼя').
- Improved info rows typography to match app design scale.
- Reworked edit dialog styling with larger radius, section paddings, and footer styling aligned with existing tokens.
- Replaced phone edit input with shared `PhoneInput` component for mask/normalization consistency.
- Added phone validation UX in modal: inline error message and disabled save when phone is incomplete/invalid.
- Fixed Base UI controlled/uncontrolled warning for gender select by using stable controlled value with sentinel `__NONE__`.
- Fixed gender value presentation: trigger now always shows human-readable Ukrainian label (`Чоловік/Жінка/Інше`) instead of DB enum.
- Added option `Не вказано` in gender selector.

Validation:
- Typecheck passed (`tsc --noEmit`).
- Lints clean for modified file.
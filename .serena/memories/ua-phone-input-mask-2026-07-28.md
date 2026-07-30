## UA phone input mask (2026-07-28)

- `PhoneInput` formats `+38 (0XX) XXX-XX-XX`.
- Prefix locked as `+38 (0` — leading 0 always present; backspace cannot remove it.
- Bugfix: `uaLocalDigits` previously treated typed `0` as part of country `380` and ate it; now digits are taken from after `(`.
- Focus rAF: capture `el = e.currentTarget` before async frame; guard `el.isConnected` (fixes null.value crash).

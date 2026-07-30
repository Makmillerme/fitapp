## Timer exit dialog — mobile button height fix (2026-07-28)

**Problem:** Exit timer modal buttons looked squashed on mobile (~22px tall) because `flex-1` in `flex-col-reverse` DialogFooter split vertical space equally; default button `h-8` too small for touch.

**Fix:**
- `src/components/ui/dialog.tsx` DialogFooter: mobile `[&_[data-slot=button]]:h-11 w-full shrink-0`, `gap-3`; desktop `sm:h-8 sm:w-auto sm:gap-2`.
- All smart-timer views (amrap, tabata, for-time, emom): button `flex-1` → `sm:flex-1` so mobile uses natural height from footer styles.

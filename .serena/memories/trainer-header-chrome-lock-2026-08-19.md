# TrainerHeader chrome lock (2026-08-19)

CRM page titles (menu + h1 row) were inconsistent: schedule used `px-2`/`px-3` and a subtitle inside the flex row (taller, menu shifted); programs/clients action icons were `size-8` vs menu `size-9`; contacts action used default Button `h-8`.

`TrainerHeader` title row is now always `h-9` (36px), `px-5 pt-6`. Subtitle renders below the row (`pl-12`), not inside it. Actions slot is `h-9`. Schedule padding overrides removed; filter/calendar/contacts actions aligned to 36px.

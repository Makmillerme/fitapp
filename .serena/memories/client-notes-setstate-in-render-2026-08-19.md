# ClientDetailView setState-in-render (2026-08-19)

Phone test: saving a client note (`upsertClientNote`) logged React error: cannot update `ClientCardDrawer` while rendering `ClientDetailView`.

Cause: `onNotesChanged` was called inside `setNotes` updaters in `handleNoteSaved` / `handleNoteDeleted`. React 19 treats the updater as render; parent `setDetail` then ran mid-render.

Fix: compute `next` from current `notes`, then `setNotes` + `onNotesChanged` in the event handler (not in the updater).

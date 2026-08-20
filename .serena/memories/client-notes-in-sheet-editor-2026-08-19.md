## In-sheet note editor (2026-08-19)

Notes create/edit/delete no longer use Dialog on top of the client card Drawer.

UX: `ClientDetailView` swaps Tabs for `ClientNoteEditor` inside the same sheet (Back / fields / Save). Delete confirmation is an in-panel Yes/No row, not AlertDialog.

Files:
- `src/components/clients/client-note-editor.tsx` (DTO + panel)
- `src/components/clients/client-detail-view.tsx` (conditional editor vs tabs)
- `src/components/clients/client-card-drawer.tsx` imports DTO from editor
- Removed `client-note-dialog.tsx`

Server actions `upsertClientNote` / `deleteClientNote` unchanged.
Measurement edit still uses Dialog (same stacking issue; out of this change).

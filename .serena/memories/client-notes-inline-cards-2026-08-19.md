## Inline notes + hover inset (2026-08-19)

Notes no longer use a subview/dialog. `ClientNoteCard` stays on Progress/Notes tabs: view with Pencil/Trash (`CardActionButton`, same style as clients list), edit expands the same card. Plus creates a local `draft:` card and opens edit. Save stays on the tab (no `onClose`).

`upsertClientNote` / `deleteClientNote` no longer `revalidatePath('/clients')` — drawer patches `clientNotes` locally. Schedule still revalidated for briefing dual-write.

Scroll lists (`client-detail-view` tabs, `clients-view`, `contacts-view`) use inner `p-1` so focus/hover rings are not clipped.

Removed `client-note-editor.tsx`. DTO lives in `client-note-card.tsx`.

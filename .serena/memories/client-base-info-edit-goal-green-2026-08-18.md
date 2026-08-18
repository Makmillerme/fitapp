# Картка клієнта — зелена ціль + edit базової інформації (2026-08-18)

## Нотатки
- Протипоказання: primary/red callout (без змін).
- **Ціль:** emerald callout (`border-emerald-500/25 bg-emerald-500/10`, іконка `bg-emerald-600`, лейбл `text-emerald-700`) — контраст до червоних протипоказань.

## Базова інформація
Шапка як в антропометрії: заголовок + Pencil.
Dialog `client-base-info-dialog.tsx`: телефон (`PhoneInput`), Telegram-тег (без @), дата народження, гендер. Вік не редагується (похідне).
Save → `upsertClientGeneral` (додано `tag` + унікальність + `assertPhoneNotTrainer`).
Drawer патчить `phone`, `tag`, `dateOfBirth`, `gender` через `onBaseInfoSaved`.

# Базова інформація — без trainer-edit (2026-08-18)

Телефон / Telegram / DOB / гендер — дані контакту, які вписує власник акаунта. Олівець і `ClientBaseInfoDialog` прибрані. Файл `client-base-info-dialog.tsx` видалено.
`upsertClientGeneral` досі приймає `tag` (зайве для UI картки, не ламає).

## Статус у шапці картки
- ACTIVE «Активний» → emerald-600 (як ціль)
- DEBT «Борг» → primary red (як протипоказання)
- PAUSED → outline

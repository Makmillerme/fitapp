# Баланс занять — stepper + пакет +10 (2026-08-18)

## UI
`src/components/clients/session-balance-card.tsx` на вкладці Загальні під базовою інформацією.
- Велика цифра (`text-4xl tabular-nums`) у muted well, − / + по боках (shadcn Button outline icon, h-8).
- Під цифрою українська форма: заняття / занять.
- 0 → `text-destructive`.
- CTA на всю ширину: **Додати 10 занять** (`adjust(10)`).
- `touch-manipulation` для швидких тапів на мобільному.

## Швидкі кліки
Кнопки **не** блокуються pending (мінус лише при 0).
Оптимістичний баланс через refs; дельти коалесяться (`queuedDelta`) і flush через **400ms** idle одним `updateClientBalance(id, sum)`.
Якщо під час запиту були ще кліки — повторний flush.
При помилці rollback до останнього confirmed + toast.
На unmount — fire-and-forget залишку дельти, щоб не втратити кліки.

Це уникає lost-update: екшен читає поточний баланс у БД і додає delta; паралельні запити перезаписували б одне одного.

## Шапка / список
`onOptimistic` оновлює Badge статусу в `ClientDetailView` одразу.
`onPatched` після flush оновлює drawer + список клієнтів (`onClientPatched`).

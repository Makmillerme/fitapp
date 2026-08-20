# phone-dev

Тимчасовий доступ до локального `next dev` зі смартфона (Chrome). **Не** частина продукту: не чіпати `package.json`, `next.config.ts`, `src/`.

## Не MCP

Не піднімати окремий MCP-сервер. Це одноразова системна команда (`adb reverse`), не довгоживучий інструмент у чаті.

## Дії агента

1. За замовчуванням — **ADB reverse** (Android + USB). LAN (`0.0.0.0`) лише якщо користувач явно без кабелю.
2. `adb` — portable у `.cursor/tools/platform-tools` (не npm, не системний SDK). Якщо немає:

```powershell
powershell -NoProfile -File .cursor/scripts/install-platform-tools.ps1
```

Потім reverse:

```powershell
powershell -NoProfile -File .cursor/scripts/phone-dev.ps1
```

Порт інший ніж 3000: `-Port 3001`.

3. Переконатися, що `npm run dev` уже запущений користувачем (агент **не** стартує dev-сервер сам).
4. Сказати відкрити на телефоні `http://localhost:3000` і на `/connect` натиснути **Увійти як Demo Admin (dev)**.
5. Після від’єднання USB — скрипт треба повторити.

Ця команда доступна як **/phone-dev**.

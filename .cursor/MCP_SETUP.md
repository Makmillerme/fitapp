# MCP налаштування для fitapp

## Проєкт

- **Next.js додаток:** корінь цього репозиторію (`fitapp/`)
- **Шлях:** `d:\Project\myprog\fitapp`
- **База даних:** PostgreSQL (локально; облікові дані лише в `.env`, не в репо)

## Serena (user-serena)

**Призначення:** Редагування коду через символьний аналіз (LSP) — точні правки без переписування файлів.

**Проєкт:** `fitapp`  
**Шлях:** `d:\Project\myprog\fitapp`

### Активація

При виклику /serena або перед редагуванням:
```
call_mcp_tool: server=user-serena, tool=activate_project, args={"project": "d:\\Project\\myprog\\fitapp"}
```

### Активні інструменти

| Інструмент | Призначення |
|------------|-------------|
| activate_project | Активація проєкту |
| find_symbol | Пошук символів (name_path_pattern, relative_path) |
| get_symbols_overview | Огляд символів у файлі |
| replace_symbol_body | Заміна тіла символу |
| insert_after_symbol | Вставка після символу |
| insert_before_symbol | Вставка перед символу |
| replace_content | Заміна патерну (literal/regex) |
| find_referencing_symbols | Пошук посилань на символ |
| search_for_pattern | Пошук патерну в проєкті |
| read_file | Читання файлу |
| create_text_file | Створення файлу |
| list_dir | Список файлів |
| find_file | Пошук файлу |
| write_memory | Запис у памʼять проєкту |
| read_memory | Читання памʼяті |
| edit_memory | Редагування памʼяті |
| rename_memory | Перейменування памʼяті |
| delete_memory | Видалення памʼяті |
| list_memories | Список памʼяток |
| rename_symbol | Перейменування символу з оновленням посилань |
| get_current_config | Поточна конфігурація |
| execute_shell_command | Виконання shell-кomанди |
| onboarding | Онбординг нового проєкту в Serena |

### Неактивні (доступні через switch_modes)

delete_lines, insert_at_line, replace_lines, restart_language_server, summarize_changes, think_about_*

### Конфігурація MCP (глобально в `~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "serena": {
      "command": "uvx",
      "args": [
        "--from",
        "git+https://github.com/oraios/serena",
        "serena",
        "start-mcp-server"
      ]
    }
  }
}
```

## Інші MCP сервери (глобальні)

| Сервер | Призначення |
|--------|-------------|
| user-shadcn | Реєстр і CLI shadcn/ui |
| user-github | GitHub API (public repos) |
| user-filesystem | Файли в `D:\Project\`, `D:\RustServer`, `~/.cursor` |
| user-next-devtools | Next.js docs і runtime analysis |
| user-sequential-thinking | Планування (/plan) |
| user-postgres-ops | PostgreSQL stack на сервері (SSH) |
| user-trello | Trello boards |
| user-payloadcms-local | Payload CMS MCP (localhost:3000) — лише якщо Payload запущено |

## Payload CMS

- **payloadcms-local** — підключати лише коли Payload CMS працює локально на `:3000`.
- Для Prisma-only модулів Payload MCP не потрібен.

## Команди Cursor

| Команда | Опис |
|---------|------|
| /plan | Sequential-thinking для планування |
| /docs | Отримати актуальну документацію |
| /serena | Виконувати завдання через Serena MCP |
| /sync | Логувати зміни в Serena |
| /init | Ініціалізація проєкту |
| /audit | Аудит коду |
| /ui-add | Додати UI компонент |
| /bot-init | Ініціалізація бота |
| /PostgresOps | Операції PostgreSQL stack |
| /uk-layout | Декодування EN-розкладки → українська |

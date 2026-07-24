# ui-add

**Shadcn First:** нові UI-блоки — лише з реєстру, після **перевірки**, що компонента ще немає (або що саме треба додати).

## Що зробити

1. **Перевір проєкт:** чи вже існує компонент у типовій теці shadcn (у цьому репозиторії — `components/ui/`). Не дублюй установку.
2. **`user-shadcn` MCP:** пошук у реєстрі (`search_items_in_registries` / `list_items_in_registries`); переконайся, що елемент **існує** в реєстрі або запропонуй найближчий офіційний варіант.
3. Отримай і виконай **CLI-додавання** через MCP (`get_add_command_for_items`) або відповідний інструмент; потім **кастомізація** (tailwind-merge, варіанти), без винаходу власних примітивів з нуля.

Деталі: skill [`ui-engineering`](../skills/ui-engineering/SKILL.md); правило [`.cursor/rules/senior-agent-workflow.mdc`](../rules/senior-agent-workflow.mdc).

Ця команда доступна в чаті як /ui-add

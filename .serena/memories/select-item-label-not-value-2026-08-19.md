## Base UI Select trigger labels (updated 2026-08-19)

`SelectItem.label` is **only typeahead**, not the closed trigger. The popup is often unmounted, so the trigger has only the raw `value` (cuid).

Correct pattern:
```tsx
<Select
  value={id}
  items={options.map((o) => ({ value: o.id, label: o.name }))}
>
  <SelectTrigger>
    <SelectValue placeholder="Оберіть">
      {(value: string | null) => options.find((o) => o.id === value)?.name ?? "Оберіть"}
    </SelectValue>
  </SelectTrigger>
</Select>
```

Applied in `create-appointment-dialog.tsx` and `chat-settings-sheet.tsx`. Gender select already renders a custom span, not `SelectValue`.

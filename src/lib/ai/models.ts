export const DEFAULT_CHAT_MODEL = "gpt-4o-mini";

export const CHAT_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o mini" },
  { id: "gpt-4o", label: "GPT-4o" },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]["id"];

export function isChatModelId(value: string): value is ChatModelId {
  return CHAT_MODELS.some((m) => m.id === value);
}

export function resolveChatModel(value?: string | null): ChatModelId {
  if (value && isChatModelId(value)) return value;
  return DEFAULT_CHAT_MODEL;
}

export function titleFromMessage(content: string) {
  const compact = content.trim().replace(/\s+/g, " ");
  if (!compact) return "Новий чат";
  return compact.length > 48 ? `${compact.slice(0, 48)}…` : compact;
}

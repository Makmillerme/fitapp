import type { ChatThreadListItem } from "@/lib/actions/chat-threads";
import type { ChatModelId } from "@/lib/ai/models";

export type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export type AiChatSession = {
  threads: ChatThreadListItem[];
  activeThreadId: string | null;
  model: ChatModelId;
  messagesByThread: Record<string, AiChatMessage[]>;
};

let session: AiChatSession | null = null;

export function readAiChatSession(): AiChatSession | null {
  return session;
}

export function writeAiChatSession(next: AiChatSession) {
  session = next;
}

export function seedAiChatSessionIfEmpty(ssr: {
  threads: ChatThreadListItem[];
  activeThreadId: string | null;
  model: ChatModelId;
  messages: AiChatMessage[];
}): AiChatSession {
  if (session) return session;
  const tid = ssr.activeThreadId;
  session = {
    threads: ssr.threads,
    activeThreadId: tid,
    model: ssr.model,
    messagesByThread: tid ? { [tid]: ssr.messages } : {},
  };
  return session;
}

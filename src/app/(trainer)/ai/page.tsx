import { requireRole } from "@/lib/auth/current-user";
import {
  getThreadMessages,
  listChatThreads,
} from "@/lib/actions/chat-threads";
import { AiChatView } from "@/components/ai/ai-chat-view";

export default async function AiPage() {
  await requireRole("ADMIN");
  const threads = await listChatThreads();
  const activeThreadId = threads[0]?.id ?? null;
  const initialMessages = activeThreadId
    ? await getThreadMessages(activeThreadId)
    : [];

  return (
    <AiChatView
      initialThreads={threads}
      initialMessages={initialMessages}
      initialThreadId={activeThreadId}
    />
  );
}

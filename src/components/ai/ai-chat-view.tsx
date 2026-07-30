"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createChatThread,
  deleteChatThread,
  getThreadMessages,
  updateThreadModel,
  type ChatThreadListItem,
  type ChatThreadMessage,
} from "@/lib/actions/chat-threads";
import {
  DEFAULT_CHAT_MODEL,
  resolveChatModel,
  type ChatModelId,
} from "@/lib/ai/models";
import { ChatSettingsSheet } from "@/components/ai/chat-settings-sheet";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { useActionDialog } from "@/hooks/use-action-dialog";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  initialThreads: ChatThreadListItem[];
  initialMessages?: ChatThreadMessage[];
  initialThreadId?: string | null;
};

const suggestions = [
  "Склади план тренування для новачка на тиждень",
  "Як написати клієнту про продовження пакету?",
  "Ідеї вправ для схуднення в залі",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function AiChatView({
  initialThreads,
  initialMessages = [],
  initialThreadId = null,
}: Props) {
  const [threads, setThreads] = useState(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(
    initialThreadId ?? initialThreads[0]?.id ?? null,
  );
  const [model, setModel] = useState<ChatModelId>(
    resolveChatModel(
      initialThreads.find((t) => t.id === (initialThreadId ?? initialThreads[0]?.id))
        ?.model ?? DEFAULT_CHAT_MODEL,
    ),
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
  );
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loadingThread, setLoadingThread] = useState(false);
  const [wantNewChat, setWantNewChat] = useActionDialog("new");
  const listRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isBusy = streamingId !== null || loadingThread;

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streamingId]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const loadThread = async (threadId: string) => {
    setLoadingThread(true);
    try {
      const items = await getThreadMessages(threadId);
      setMessages(
        items.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        })),
      );
      const thread = threads.find((t) => t.id === threadId);
      if (thread) setModel(resolveChatModel(thread.model));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не вдалося завантажити чат");
    } finally {
      setLoadingThread(false);
    }
  };

  const handleNewChat = async () => {
    abortRef.current?.abort();
    setStreamingId(null);
    try {
      const thread = await createChatThread(model);
      setThreads((prev) => [thread, ...prev]);
      setActiveThreadId(thread.id);
      setMessages([]);
      setModel(resolveChatModel(thread.model));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не вдалося створити чат");
    }
  };

  useEffect(() => {
    if (!wantNewChat) return;
    setWantNewChat(false);
    void handleNewChat();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per action=new
  }, [wantNewChat]);

  const handleSelectThread = (threadId: string) => {
    if (threadId === activeThreadId) return;
    abortRef.current?.abort();
    setStreamingId(null);
    setActiveThreadId(threadId);
    void loadThread(threadId);
  };

  const handleModelChange = async (next: ChatModelId) => {
    setModel(next);
    if (!activeThreadId) return;
    try {
      await updateThreadModel(activeThreadId, next);
      setThreads((prev) =>
        prev.map((t) => (t.id === activeThreadId ? { ...t, model: next } : t)),
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не вдалося змінити модель");
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteChatThread(threadId);
      const nextThreads = threads.filter((t) => t.id !== threadId);
      setThreads(nextThreads);

      if (activeThreadId === threadId) {
        abortRef.current?.abort();
        setStreamingId(null);
        const fallback = nextThreads[0]?.id ?? null;
        setActiveThreadId(fallback);
        if (fallback) {
          void loadThread(fallback);
        } else {
          setMessages([]);
        }
      }
      toast.success("Чат видалено");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не вдалося видалити");
    }
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
    };
    const assistantId = createId();

    setMessages((prev) => [
      ...prev,
      userMessage,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setStreamingId(assistantId);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: activeThreadId ?? undefined,
          message: trimmed,
          model,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Потрібна авторизація"
            : "Не вдалося отримати відповідь",
        );
      }

      const responseThreadId = response.headers.get("X-Thread-Id");
      if (responseThreadId && responseThreadId !== activeThreadId) {
        setActiveThreadId(responseThreadId);
      }

      if (response.headers.get("X-Chat-Mock") === "1") {
        toast.message("Demo режим — додай OPENAI_API_KEY");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream unavailable");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: snapshot } : m,
          ),
        );
      }

      accumulated += decoder.decode();
      if (accumulated) {
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: snapshot } : m,
          ),
        );
      }

      if (!accumulated.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Не вдалося сформувати відповідь. Спробуй ще раз.",
                }
              : m,
          ),
        );
      }

      const threadKey = responseThreadId ?? activeThreadId;
      if (threadKey) {
        setThreads((prev) => {
          const existing = prev.find((t) => t.id === threadKey);
          const nextItem: ChatThreadListItem = {
            id: threadKey,
            title: existing?.title ?? trimmed.slice(0, 48),
            model,
            updatedAt: new Date().toISOString(),
            preview: accumulated || trimmed,
          };
          const rest = prev.filter((t) => t.id !== threadKey);
          return [nextItem, ...rest];
        });
      }
    } catch (e) {
      if (controller.signal.aborted) return;

      toast.error(e instanceof Error ? e.message : "Помилка чату");
      setMessages((prev) =>
        prev.filter((m) => m.id !== userMessage.id && m.id !== assistantId),
      );
      setInput(trimmed);
    } finally {
      setStreamingId((current) => (current === assistantId ? null : current));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(input);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <TrainerHeader
        title="AI"
        className="border-b border-gray-100 pb-3"
        contentClassName="mb-0"
        actions={
          <ChatSettingsSheet
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            threads={threads}
            activeThreadId={activeThreadId}
            model={model}
            onModelChange={(next) => void handleModelChange(next)}
            onSelectThread={handleSelectThread}
            onNewChat={() => void handleNewChat()}
            onDeleteThread={(id) => void handleDeleteThread(id)}
          />
        }
      />

      <div
        ref={listRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto hide-scrollbar px-4 py-4"
      >
        {loadingThread ? (
          <div className="flex flex-1 flex-col gap-3 py-2" aria-busy="true">
            <div className="h-16 w-[72%] animate-pulse rounded-2xl bg-muted/70" />
            <div className="ml-auto h-12 w-[60%] animate-pulse rounded-2xl bg-muted/50" />
            <div className="h-20 w-[80%] animate-pulse rounded-2xl bg-muted/70" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-7 fill-current" />
            </div>
            <div>
              <p className="text-base font-bold">Чим можу допомогти?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Запитай про програми, клієнтів або комунікацію — як у ChatGPT.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => void send(item)}
                  disabled={isBusy}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left text-sm text-foreground shadow-sm transition-colors active:bg-muted disabled:opacity-50"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  message.role === "user"
                    ? "rounded-br-md bg-primary text-white"
                    : "rounded-bl-md bg-white text-foreground shadow-card",
                )}
              >
                {message.content}
                {message.role === "assistant" &&
                message.id === streamingId &&
                !message.content ? (
                  <span className="inline-flex gap-1 align-middle">
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/40" />
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:150ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/40 [animation-delay:300ms]" />
                  </span>
                ) : null}
                {message.role === "assistant" &&
                message.id === streamingId &&
                message.content ? (
                  <span
                    className="ml-0.5 inline-block h-4 w-0.5 translate-y-px animate-pulse bg-foreground/70"
                    aria-hidden
                  />
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex shrink-0 items-end gap-2 px-4 pb-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напиши повідомлення…"
          disabled={isBusy}
          rows={1}
          className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border-gray-100 bg-white px-4 py-3 text-sm shadow-card"
        />
        <Button
          type="button"
          size="icon"
          disabled={isBusy || !input.trim()}
          onClick={() => void send(input)}
          className="size-11 shrink-0 rounded-full shadow-float"
          aria-label="Надіслати"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}

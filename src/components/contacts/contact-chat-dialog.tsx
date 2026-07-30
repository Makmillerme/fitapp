"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { ArrowUp, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  listContactMessages,
  sendContactMessage,
  type ContactChatMessage,
} from "@/lib/actions/contact-messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
};

export function ContactChatDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
}: Props) {
  const [messages, setMessages] = useState<ContactChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    setInput("");

    void listContactMessages(contactId)
      .then((items) => {
        if (!cancelled) setMessages(items);
      })
      .catch((e) => {
        if (!cancelled) {
          toast.error(
            e instanceof Error ? e.message : "Не вдалося завантажити чат",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, contactId]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, loading]);

  const send = (raw: string) => {
    const body = raw.trim();
    if (!body || pending) return;

    startTransition(async () => {
      try {
        const message = await sendContactMessage({ contactId, body });
        setMessages((prev) => [...prev, message]);
        setInput("");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Не вдалося надіслати");
      }
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex h-[min(32rem,80dvh)] w-[min(calc(100%-2rem),24rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0"
      >
        <DialogHeader className="shrink-0 border-b border-gray-100 px-4 py-3">
          <DialogTitle className="truncate text-base font-bold">
            {contactName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Синхронізація з Telegram зʼявиться пізніше
          </DialogDescription>
        </DialogHeader>

        <div
          ref={listRef}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto hide-scrollbar px-4 py-4"
        >
          {loading ? (
            <div className="flex flex-1 flex-col gap-3 py-2" aria-busy="true">
              <div className="h-12 w-[70%] animate-pulse rounded-2xl bg-muted/70" />
              <div className="ml-auto h-10 w-[55%] animate-pulse rounded-2xl bg-muted/50" />
              <div className="h-14 w-[75%] animate-pulse rounded-2xl bg-muted/70" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageSquare className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold">Немає повідомлень</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Напишіть перше повідомлення
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex w-full",
                  message.senderRole === "ADMIN"
                    ? "justify-end"
                    : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    message.senderRole === "ADMIN"
                      ? "rounded-br-md bg-primary text-white"
                      : "rounded-bl-md bg-white text-foreground shadow-card",
                  )}
                >
                  {message.body}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex shrink-0 items-end gap-2 border-t border-gray-100 px-4 py-3">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Написати…"
            disabled={pending || loading}
            rows={1}
            className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border-gray-100 bg-white px-4 py-3 text-sm shadow-card"
          />
          <Button
            type="button"
            size="icon"
            disabled={pending || loading || !input.trim()}
            onClick={() => send(input)}
            className="size-11 shrink-0 rounded-full shadow-float"
            aria-label="Надіслати"
          >
            <ArrowUp className="size-5" strokeWidth={2.5} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

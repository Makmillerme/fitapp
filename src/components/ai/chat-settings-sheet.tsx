"use client";

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { MessageSquarePlus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { CHAT_MODELS, type ChatModelId } from "@/lib/ai/models";
import type { ChatThreadListItem } from "@/lib/actions/chat-threads";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threads: ChatThreadListItem[];
  activeThreadId: string | null;
  model: ChatModelId;
  onModelChange: (model: ChatModelId) => void;
  onSelectThread: (threadId: string) => void;
  onNewChat: () => void;
  onDeleteThread: (threadId: string) => void;
};

export function ChatSettingsSheet({
  open,
  onOpenChange,
  threads,
  activeThreadId,
  model,
  onModelChange,
  onSelectThread,
  onNewChat,
  onDeleteThread,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-white text-foreground shadow-card transition-transform active:scale-95"
            aria-label="Налаштування чату"
          />
        }
      >
        <Settings className="size-4" />
      </SheetTrigger>

      <SheetContent side="right" className="gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b border-gray-100 px-4 py-4">
          <SheetTitle className="text-lg font-bold">Чати</SheetTitle>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="chat-model" className="text-xs text-muted-foreground">
              Модель
            </Label>
            <Select
              value={model}
              onValueChange={(v) => {
                if (v) onModelChange(v as ChatModelId);
              }}
              items={CHAT_MODELS.map((item) => ({
                value: item.id,
                label: item.label,
              }))}
            >
              <SelectTrigger id="chat-model" className="w-full rounded-xl">
                <SelectValue>
                  {(value: string | null) =>
                    CHAT_MODELS.find((item) => item.id === value)?.label ?? value
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODELS.map((item) => (
                  <SelectItem key={item.id} value={item.id} label={item.label}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            className="mt-3 w-full rounded-xl font-bold"
            onClick={() => {
              onNewChat();
              onOpenChange(false);
            }}
          >
            <MessageSquarePlus className="size-4" />
            Новий чат
          </Button>
        </SheetHeader>

        <div className="flex-1 space-y-1 overflow-y-auto hide-scrollbar p-2">
          {threads.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              Історія порожня. Почни новий діалог.
            </p>
          ) : (
            threads.map((thread) => {
              const active = thread.id === activeThreadId;
              return (
                <div
                  key={thread.id}
                  className={cn(
                    "group flex items-start gap-1 rounded-2xl p-1",
                    active && "bg-primary/5",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectThread(thread.id);
                      onOpenChange(false);
                    }}
                    className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-left transition-colors active:bg-muted"
                  >
                    <p className="truncate text-sm font-bold">
                      {thread.title ?? "Новий чат"}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {format(new Date(thread.updatedAt), "d MMM, HH:mm", {
                        locale: uk,
                      })}
                      {thread.preview ? ` · ${thread.preview}` : ""}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label="Видалити чат"
                    onClick={() => onDeleteThread(thread.id)}
                    className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

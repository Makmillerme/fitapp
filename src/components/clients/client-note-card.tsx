"use client";

import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardActionButton } from "@/components/ui/card-action-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteClientNote, upsertClientNote } from "@/lib/actions/notes";
import { cn } from "@/lib/utils";

export type ClientNoteDto = {
  id: string;
  kind: "PROGRESS" | "GENERAL";
  templateKey: string | null;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export function isDraftNoteId(id: string) {
  return id.startsWith("draft:");
}

export function createDraftNote(
  kind: "PROGRESS" | "GENERAL",
): ClientNoteDto {
  const now = new Date().toISOString();
  return {
    id: `draft:${kind}:${now}`,
    kind,
    templateKey: null,
    title: "",
    body: "",
    createdAt: now,
    updatedAt: now,
  };
}

function toDto(
  note: Awaited<ReturnType<typeof upsertClientNote>>,
): ClientNoteDto {
  return {
    id: note.id,
    kind: note.kind,
    templateKey: note.templateKey,
    title: note.title,
    body: note.body,
    createdAt: new Date(note.createdAt).toISOString(),
    updatedAt: new Date(note.updatedAt).toISOString(),
  };
}

type Appearance = "default" | "goal" | "contra";

type Props = {
  clientId: string;
  note: ClientNoteDto;
  editing: boolean;
  appearance?: Appearance;
  icon?: ReactNode;
  emptyHint?: string;
  showDate?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSaved: (saved: ClientNoteDto, previousId: string) => void;
  onDeleted?: (noteId: string) => void;
};

export function ClientNoteCard({
  clientId,
  note,
  editing,
  appearance = "default",
  icon,
  emptyHint,
  showDate = false,
  onEdit,
  onCancel,
  onSaved,
  onDeleted,
}: Props) {
  const isTemplate = Boolean(note.templateKey);
  const isDraft = isDraftNoteId(note.id);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition] = useTransition();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(note.title);
    setBody(note.body);
    setConfirmDelete(false);
  }, [note.id, note.title, note.body, editing]);

  useEffect(() => {
    if (!editing) return;
    cardRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [editing]);

  const save = () => {
    const nextTitle = title.trim();
    if (!isTemplate && !nextTitle) {
      toast.error("Вкажіть назву");
      return;
    }

    startTransition(async () => {
      try {
        const result = await upsertClientNote({
          clientId,
          ...(isDraft ? { kind: note.kind } : { id: note.id }),
          title: nextTitle,
          body: body.trim(),
        });
        onSaved(toDto(result), note.id);
        toast.success("Нотатку збережено");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Не вдалося зберегти",
        );
      }
    });
  };

  const remove = () => {
    if (isTemplate) return;
    if (isDraft) {
      onDeleted?.(note.id);
      return;
    }
    startTransition(async () => {
      try {
        await deleteClientNote(clientId, note.id);
        onDeleted?.(note.id);
        toast.success("Нотатку видалено");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Не вдалося видалити",
        );
      }
    });
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-full rounded-2xl border p-4 text-left",
        appearance === "default" && "border-border bg-card shadow-card",
        appearance === "contra" && "border-primary/20 bg-primary/10",
        appearance === "goal" && "border-emerald-500/25 bg-emerald-500/10",
      )}
    >
      {editing ? (
        <div className="space-y-3">
          <div className="grid gap-1.5">
            <Label htmlFor={`note-title-${note.id}`}>Назва</Label>
            <Input
              id={`note-title-${note.id}`}
              value={title}
              disabled={isTemplate || pending}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-xl"
              maxLength={80}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`note-body-${note.id}`}>Опис</Label>
            <Textarea
              id={`note-body-${note.id}`}
              value={body}
              disabled={pending}
              onChange={(event) => setBody(event.target.value)}
              className="min-h-28 rounded-xl"
              maxLength={4000}
            />
          </div>
          {confirmDelete && !isTemplate ? (
            <div className="flex flex-col gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-sm font-medium">Видалити цю нотатку?</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  className="flex-1 rounded-xl"
                  onClick={() => setConfirmDelete(false)}
                >
                  Ні
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  className="flex-1 rounded-xl"
                  onClick={remove}
                >
                  Так
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                className="rounded-xl"
                onClick={onCancel}
              >
                Скасувати
              </Button>
              <Button
                type="button"
                disabled={pending}
                className="flex-1 rounded-xl"
                onClick={save}
              >
                Зберегти
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {icon ? (
                <span className="shrink-0 text-muted-foreground">{icon}</span>
              ) : null}
              <p
                className={cn(
                  "min-w-0 truncate font-bold",
                  appearance === "default"
                    ? "text-sm text-foreground"
                    : "text-[11px] uppercase tracking-wide",
                  appearance === "contra" && "text-primary",
                  appearance === "goal" && "text-emerald-700",
                )}
              >
                {note.title}
              </p>
            </div>
            {note.body.trim() ? (
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {note.body}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                {emptyHint ?? "Поки порожньо."}
              </p>
            )}
            {showDate ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {format(new Date(note.updatedAt), "d MMM", { locale: uk })}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <CardActionButton
              aria-label="Редагувати нотатку"
              onClick={onEdit}
            >
              <Pencil className="size-4" />
            </CardActionButton>
            {!isTemplate ? (
              confirmDelete ? (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={pending}
                    onClick={() => setConfirmDelete(false)}
                  >
                    Ні
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="rounded-xl"
                    disabled={pending}
                    onClick={remove}
                  >
                    Так
                  </Button>
                </div>
              ) : (
                <CardActionButton
                  tone="destructive"
                  aria-label="Видалити нотатку"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="size-4" />
                </CardActionButton>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

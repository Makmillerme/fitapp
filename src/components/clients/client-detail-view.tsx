"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { AlertCircle, Dumbbell, Plus, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyMeasurementsCard } from "@/components/clients/body-measurements-card";
import type { MeasurementSavePatch } from "@/components/clients/measurement-edit-dialog";
import {
  ClientNoteCard,
  createDraftNote,
  isDraftNoteId,
  type ClientNoteDto,
} from "@/components/clients/client-note-card";
import { SessionBalanceCard } from "@/components/clients/session-balance-card";
import {
  NOTE_TEMPLATE_CONTRA,
  NOTE_TEMPLATE_GOAL,
} from "@/lib/notes/templates";
import { cn } from "@/lib/utils";

const HISTORY_UI_PREVIEW = [
  {
    id: "history-preview-1",
    dateLabel: "22.07",
    title: "Спина / Біцепс",
    description: "Тяга блоку: 60кг 4х10. Біцепс штанга: 30кг 3х12.",
  },
  {
    id: "history-preview-2",
    dateLabel: "19.07",
    title: "Груди / Трицепс",
    description: "Жим гантелей 30кг. Розгинання 25кг.",
  },
] as const;

type HistoryTimelineItem = {
  id: string;
  dateLabel: string;
  title: string;
  description: string;
};

type Props = {
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    photoUrl?: string | null;
    goal: string | null;
    notes: string | null;
    dateOfBirth: string | null;
    heightCm: number | null;
    weightKg: number | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    sessionBalance: number;
    status: string;
    telegramId: string | null;
    tag: string | null;
  };
  onClientPatched?: (patch: {
    id: string;
    sessionBalance: number;
    status: string;
  }) => void;
  onMeasurementsSaved?: (patch: MeasurementSavePatch) => void;
  onNotesChanged?: (notes: ClientNoteDto[]) => void;
  appointments: Array<{
    id: string;
    startAt: string;
    status: string;
    notes?: string | null;
    program: { name: string } | null;
  }>;
  clientNotes: ClientNoteDto[];
  latestMeasurement: {
    measuredAt: string | null;
    neckCm: number | null;
    chestCm: number | null;
    waistCm: number | null;
    hipsCm: number | null;
    bicepsCm: number | null;
    shoulderCm: number | null;
    forearmCm: number | null;
    thighCm: number | null;
    calfCm: number | null;
    heightCm: number | null;
  } | null;
};

const GENDER_LABELS = {
  MALE: "Чоловік",
  FEMALE: "Жінка",
  OTHER: "Інше",
} as const;

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Активний",
  DEBT: "Борг",
  PAUSED: "Пауза",
};

function formatDob(dateOfBirthIso: string | null): string {
  if (!dateOfBirthIso) return "—";
  const birthDate = new Date(dateOfBirthIso);
  if (Number.isNaN(birthDate.getTime())) return "—";
  return format(birthDate, "d MMMM yyyy", { locale: uk });
}

function formatTelegram(telegramId: string | null, tag: string | null): string {
  const handle = tag?.trim();
  if (handle) return handle.startsWith("@") ? handle : `@${handle}`;
  if (!telegramId) return "Не підключено";
  try {
    if (BigInt(telegramId) >= BigInt("1000000000000")) return "Не підключено";
  } catch {
    return "Не підключено";
  }
  return "Підключено";
}

function calculateAge(dateOfBirthIso: string | null): string {
  if (!dateOfBirthIso) return "—";
  const birthDate = new Date(dateOfBirthIso);
  if (Number.isNaN(birthDate.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDelta = now.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 0 ? `${age}` : "—";
}

function persistedNotes(list: ClientNoteDto[]) {
  return list.filter((note) => !isDraftNoteId(note.id));
}

export function ClientDetailView({
  client,
  appointments,
  clientNotes,
  latestMeasurement,
  onClientPatched,
  onMeasurementsSaved,
  onNotesChanged,
}: Props) {
  const name = `${client.firstName} ${client.lastName ?? ""}`.trim();
  const initial = client.firstName.charAt(0).toUpperCase();
  const telegramLabel = formatTelegram(client.telegramId, client.tag);

  const [status, setStatus] = useState(client.status);
  const [notes, setNotes] = useState(clientNotes);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    setStatus(client.status);
  }, [client.id, client.status]);

  useEffect(() => {
    setNotes(clientNotes);
    setEditingNoteId(null);
  }, [client.id]);

  const statusLabel = STATUS_LABELS[status] ?? status;

  const historyItems = useMemo<HistoryTimelineItem[]>(() => {
    if (appointments.length > 0) {
      return appointments.map((a) => ({
        id: a.id,
        dateLabel: format(new Date(a.startAt), "dd.MM"),
        title: a.program?.name ?? "Тренування",
        description:
          a.notes?.trim() ||
          format(new Date(a.startAt), "d MMMM yyyy, HH:mm", { locale: uk }),
      }));
    }
    return HISTORY_UI_PREVIEW.map((item) => ({ ...item }));
  }, [appointments]);

  const progressNotes = notes.filter((note) => note.kind === "PROGRESS");
  const goalNote = notes.find((note) => note.templateKey === NOTE_TEMPLATE_GOAL);
  const contraNote = notes.find(
    (note) => note.templateKey === NOTE_TEMPLATE_CONTRA,
  );
  const generalNotes = notes.filter(
    (note) => note.kind === "GENERAL" && !note.templateKey,
  );

  const startDraft = (kind: "PROGRESS" | "GENERAL") => {
    const existingDraft = notes.find(
      (note) => isDraftNoteId(note.id) && note.kind === kind,
    );
    if (existingDraft) {
      setEditingNoteId(existingDraft.id);
      return;
    }
    const draft = createDraftNote(kind);
    setNotes((prev) => [draft, ...prev]);
    setEditingNoteId(draft.id);
  };

  const handleNoteSaved = (saved: ClientNoteDto, previousId: string) => {
    const withoutPrev = notes.filter((note) => note.id !== previousId);
    const exists = withoutPrev.some((note) => note.id === saved.id);
    const next = exists
      ? withoutPrev.map((note) => (note.id === saved.id ? saved : note))
      : [saved, ...withoutPrev];
    setNotes(next);
    setEditingNoteId(null);
    onNotesChanged?.(persistedNotes(next));
  };

  const handleNoteDeleted = (noteId: string) => {
    const next = notes.filter((note) => note.id !== noteId);
    setNotes(next);
    setEditingNoteId((current) => (current === noteId ? null : current));
    onNotesChanged?.(persistedNotes(next));
  };

  const handleCancel = (note: ClientNoteDto) => {
    if (isDraftNoteId(note.id)) {
      setNotes((prev) => prev.filter((item) => item.id !== note.id));
    }
    setEditingNoteId(null);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-popover">
      <div className="mx-auto flex w-full min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center gap-3 px-5 pt-1">
          <Avatar className="size-14 shrink-0">
            {client.photoUrl ? (
              <AvatarImage src={client.photoUrl} alt={name} />
            ) : null}
            <AvatarFallback className="bg-muted text-xl font-bold text-muted-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-tight text-foreground">
              {name}
            </h1>
            <div className="mt-0.5">
              <Badge
                variant={status === "PAUSED" ? "outline" : "secondary"}
                className={cn(
                  status === "ACTIVE" &&
                    "border-transparent bg-emerald-600 text-white",
                  status === "DEBT" &&
                    "border-transparent bg-primary text-primary-foreground",
                )}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          className="mt-3 flex min-h-0 flex-1 flex-col gap-0 px-4 pb-4"
        >
          <TabsList className="h-11 w-full shrink-0 gap-1 rounded-2xl bg-muted p-1">
            <TabsTrigger
              value="overview"
              className="flex-1 rounded-xl px-2 text-xs font-bold data-active:bg-card data-active:shadow-sm sm:text-sm"
            >
              Загальні
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="flex-1 rounded-xl px-2 text-xs font-bold data-active:bg-card data-active:shadow-sm sm:text-sm"
            >
              Прогрес
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex-1 rounded-xl px-2 text-xs font-bold data-active:bg-card data-active:shadow-sm sm:text-sm"
            >
              Історія
            </TabsTrigger>
            <TabsTrigger
              value="notes"
              className="flex-1 rounded-xl px-2 text-xs font-bold data-active:bg-card data-active:shadow-sm sm:text-sm"
            >
              Нотатки
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="overview"
            className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y hide-scrollbar"
          >
            <div className="space-y-3 p-1">
            <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
              <p className="mb-1 text-sm font-bold text-foreground">Базова інформація</p>
              <dl className="divide-y divide-border">
                {[
                  { label: "Телефон", value: client.phone ?? "—" },
                  {
                    label: "Telegram",
                    value: telegramLabel,
                    valueClass:
                      telegramLabel === "Не підключено"
                        ? "text-muted-foreground"
                        : undefined,
                  },
                  { label: "Дата народження", value: formatDob(client.dateOfBirth) },
                  { label: "Вік", value: calculateAge(client.dateOfBirth) },
                  {
                    label: "Гендер",
                    value: client.gender ? GENDER_LABELS[client.gender] : "—",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-3 py-2.5"
                  >
                    <dt className="shrink-0 text-xs text-muted-foreground">{row.label}</dt>
                    <dd
                      className={cn(
                        "min-w-0 truncate text-right text-sm font-medium text-foreground",
                        row.valueClass,
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <SessionBalanceCard
              clientId={client.id}
              sessionBalance={client.sessionBalance}
              status={client.status}
              onOptimistic={(patch) => setStatus(patch.status)}
              onPatched={(patch) => {
                setStatus(patch.status);
                onClientPatched?.(patch);
              }}
            />
            </div>
          </TabsContent>

          <TabsContent
            value="progress"
            className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y hide-scrollbar"
          >
            <div className="space-y-3 p-1">
            <BodyMeasurementsCard
              clientId={client.id}
              weightKg={client.weightKg}
              onSaved={onMeasurementsSaved}
              measurements={{
                measuredAt: latestMeasurement?.measuredAt ?? null,
                neckCm: latestMeasurement?.neckCm ?? null,
                chestCm: latestMeasurement?.chestCm ?? null,
                waistCm: latestMeasurement?.waistCm ?? null,
                hipsCm: latestMeasurement?.hipsCm ?? null,
                bicepsCm: latestMeasurement?.bicepsCm ?? null,
                shoulderCm: latestMeasurement?.shoulderCm ?? null,
                forearmCm: latestMeasurement?.forearmCm ?? null,
                thighCm: latestMeasurement?.thighCm ?? null,
                calfCm: latestMeasurement?.calfCm ?? null,
                heightCm:
                  latestMeasurement?.heightCm ??
                  client.heightCm ??
                  null,
              }}
            />
            <div className="flex items-center justify-between gap-2 pr-0.5">
              <p className="text-sm font-bold text-foreground">Прогрес</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label="Додати запис прогресу"
                onClick={() => startDraft("PROGRESS")}
              >
                <Plus />
              </Button>
            </div>
            {progressNotes.length === 0 ? (
              <div className="flex flex-col items-start gap-3 rounded-2xl border border-border bg-muted/60 p-5">
                <p className="text-sm text-muted-foreground">
                  Поки немає записів. Додай назву і опис — жим, час WOD, повтори.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => startDraft("PROGRESS")}
                >
                  Додати запис
                </Button>
              </div>
            ) : (
              progressNotes.map((item) => (
                <ClientNoteCard
                  key={item.id}
                  clientId={client.id}
                  note={item}
                  editing={editingNoteId === item.id}
                  icon={<Dumbbell className="size-4" />}
                  showDate={!isDraftNoteId(item.id)}
                  onEdit={() => setEditingNoteId(item.id)}
                  onCancel={() => handleCancel(item)}
                  onSaved={handleNoteSaved}
                  onDeleted={handleNoteDeleted}
                />
              ))
            )}
            </div>
          </TabsContent>

          <TabsContent
            value="history"
            className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y hide-scrollbar p-1"
          >
            <ol className="relative space-y-5 pl-11">
              <span
                aria-hidden
                className="absolute bottom-3 left-[1.15rem] top-3 w-px bg-border"
              />
              {historyItems.map((item, index) => {
                const isLatest = index === 0;
                return (
                  <li key={item.id} className="relative">
                    <span
                      className={cn(
                        "absolute -left-11 top-4 flex size-9 items-center justify-center rounded-full text-[10px] font-bold leading-none",
                        isLatest
                          ? "bg-primary text-primary-foreground shadow-float"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.dateLabel}
                    </span>
                    <div className="rounded-2xl bg-muted/80 p-4">
                      <p
                        className={cn(
                          "text-sm font-bold leading-snug",
                          isLatest ? "text-foreground" : "text-foreground/80",
                        )}
                      >
                        {item.title}
                      </p>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </TabsContent>

          <TabsContent
            value="notes"
            className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain touch-pan-y hide-scrollbar"
          >
            <div className="space-y-3 p-1">
            <div className="flex items-center justify-between gap-2 pr-0.5">
              <p className="text-sm font-bold text-foreground">Нотатки</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl"
                aria-label="Додати нотатку"
                onClick={() => startDraft("GENERAL")}
              >
                <Plus />
              </Button>
            </div>

            {contraNote ? (
              <ClientNoteCard
                clientId={client.id}
                note={contraNote}
                editing={editingNoteId === contraNote.id}
                appearance="contra"
                icon={<AlertCircle className="size-4 text-primary" />}
                emptyHint="Поки не додано."
                onEdit={() => setEditingNoteId(contraNote.id)}
                onCancel={() => handleCancel(contraNote)}
                onSaved={handleNoteSaved}
              />
            ) : null}

            {goalNote ? (
              <ClientNoteCard
                clientId={client.id}
                note={goalNote}
                editing={editingNoteId === goalNote.id}
                appearance="goal"
                icon={<Target className="size-4 text-emerald-700" />}
                emptyHint="Поки не додано."
                onEdit={() => setEditingNoteId(goalNote.id)}
                onCancel={() => handleCancel(goalNote)}
                onSaved={handleNoteSaved}
              />
            ) : null}

            {generalNotes.map((item) => (
              <ClientNoteCard
                key={item.id}
                clientId={client.id}
                note={item}
                editing={editingNoteId === item.id}
                onEdit={() => setEditingNoteId(item.id)}
                onCancel={() => handleCancel(item)}
                onSaved={handleNoteSaved}
                onDeleted={handleNoteDeleted}
              />
            ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

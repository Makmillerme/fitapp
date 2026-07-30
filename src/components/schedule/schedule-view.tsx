"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addDays,
  format,
  isSameDay,
  startOfDay,
} from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiBriefingDrawer } from "@/components/schedule/ai-briefing-drawer";
import { WorkoutTimer } from "@/components/timer/workout-timer";
import { CreateAppointmentDialog } from "@/components/schedule/create-appointment-dialog";
import { useActionDialog } from "@/hooks/use-action-dialog";

export type ScheduleAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  location: string | null;
  notes: string | null;
  status: string;
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
    photoUrl: string | null;
  };
  program: { id: string; name: string } | null;
};

type ClientOption = { id: string; firstName: string; lastName: string | null };

type Props = {
  initialDate: string;
  appointments: ScheduleAppointment[];
  clients: ClientOption[];
};

function durationLabel(start: Date, end: Date) {
  const mins = Math.round((end.getTime() - start.getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h} год ${m} хв`;
  if (h) return `${h} год`;
  return `${m} хв`;
}

export function ScheduleView({
  initialDate,
  appointments,
  clients,
}: Props) {
  const base = startOfDay(new Date(initialDate));
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(base, i - 1)),
    [base],
  );
  const [selected, setSelected] = useState(base);
  const [briefingClientId, setBriefingClientId] = useState<string | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useActionDialog();
  const [, startTransition] = useTransition();

  const dayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.startAt), selected),
  );

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TrainerHeader
        className="px-2"
        contentClassName="mb-4 px-3"
        title={
          isSameDay(selected, new Date())
            ? "Сьогодні"
            : format(selected, "d MMMM", { locale: uk })
        }
        subtitle={format(selected, "d MMMM, EEEE", { locale: uk })}
        actions={
          <div className="flex size-10 items-center justify-center rounded-full border border-gray-100 bg-white shadow-card">
            <Calendar className="size-5" />
          </div>
        }
      >
        <div className="hide-scrollbar flex gap-3 overflow-x-auto px-3 pb-2">
          {days.map((day) => {
            const active = isSameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelected(day)}
                className={cn(
                  "relative flex h-16 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border transition-transform active:scale-95",
                  active
                    ? "border-transparent bg-primary text-white shadow-float"
                    : "border-gray-100 bg-white text-foreground",
                )}
              >
                <span
                  className={cn(
                    "mb-1 text-[10px] font-bold uppercase",
                    active ? "opacity-90" : "text-muted-foreground",
                  )}
                >
                  {format(day, "EEEEEE", { locale: uk })}
                </span>
                <span className="text-lg font-bold">{format(day, "d")}</span>
              </button>
            );
          })}
        </div>
      </TrainerHeader>

      <div className="relative flex-1 space-y-4 overflow-y-auto hide-scrollbar p-5">
        <div className="absolute bottom-0 left-[39px] top-5 z-0 w-px bg-gray-200" />

        {dayAppointments.length === 0 ? (
          <p className="relative z-10 text-sm text-muted-foreground">
            Немає записів на цей день.
          </p>
        ) : (
          dayAppointments.map((item, index) => {
            const start = new Date(item.startAt);
            const end = new Date(item.endAt);
            const name = `${item.client.firstName} ${item.client.lastName ?? ""}`.trim();
            const isFirst = index === 0;
            return (
              <div
                key={item.id}
                className={cn("relative z-10 flex gap-4", !isFirst && "opacity-80")}
              >
                <div className="w-10 shrink-0 pt-2 text-right">
                  <span className="text-xs font-bold text-muted-foreground">
                    {format(start, "HH:mm")}
                  </span>
                </div>
                <div className="relative flex-1 overflow-hidden rounded-3xl bg-white p-5 shadow-card">
                  <div
                    className={cn(
                      "absolute left-0 top-0 h-full w-1",
                      isFirst ? "bg-primary" : "bg-gray-300",
                    )}
                  />
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold leading-tight">{name}</h3>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        {item.program?.name ?? item.notes ?? "Тренування"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBriefingClientId(item.client.id)}
                      className="flex size-8 items-center justify-center rounded-full bg-muted text-primary transition-transform active:scale-90"
                      aria-label="ШІ-брифінг"
                    >
                      <Sparkles className="size-4 fill-current" />
                    </button>
                  </div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="rounded-md text-[10px] font-bold">
                      {durationLabel(start, end)}
                    </Badge>
                    {item.location ? (
                      <Badge variant="secondary" className="rounded-md text-[10px] font-bold">
                        {item.location}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={item.program ? `/programs/${item.program.id}` : "/programs"}
                      className="flex flex-1 items-center justify-center rounded-xl bg-secondary py-2.5 text-xs font-bold text-secondary-foreground"
                    >
                      Програма
                    </a>
                    <Button
                      className="flex-1 rounded-xl text-xs font-bold shadow-float"
                      onClick={() => setTimerOpen(true)}
                    >
                      <Play className="size-3.5 fill-current" />
                      Таймер
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div className="h-8" />
      </div>

      <AiBriefingDrawer
        clientId={briefingClientId}
        open={!!briefingClientId}
        onOpenChange={(open) => {
          if (!open) setBriefingClientId(null);
        }}
      />

      <WorkoutTimer open={timerOpen} onOpenChange={setTimerOpen} />

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clients={clients}
        defaultDate={selected}
        onCreated={() => {
          startTransition(() => {
            window.location.reload();
          });
        }}
      />
    </div>
  );
}

"use client";

import { useCallback, useMemo, useState } from "react";
import { addWeeks, format, isSameDay, startOfWeek } from "date-fns";
import { uk } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { AiBriefingDrawer } from "@/components/schedule/ai-briefing-drawer";
import { WorkoutTimer } from "@/components/timer/workout-timer";
import { AppointmentCardDrawer } from "@/components/schedule/appointment-card-drawer";
import { CreateAppointmentDialog } from "@/components/schedule/create-appointment-dialog";
import { WeekKanbanBoard } from "@/components/schedule/week-kanban-board";
import type { ScheduleAppointment } from "@/components/schedule/schedule-appointment";
import { useActionDialog } from "@/hooks/use-action-dialog";

export type { ScheduleAppointment };

type ClientOption = { id: string; firstName: string; lastName: string | null };

type Props = {
  initialDate: string;
  appointments: ScheduleAppointment[];
  clients: ClientOption[];
};

export function ScheduleView({
  initialDate,
  appointments,
  clients,
}: Props) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(initialDate), { weekStartsOn: 1 }),
  );
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate));
  const [briefingClientId, setBriefingClientId] = useState<string | null>(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [openAppointment, setOpenAppointment] =
    useState<ScheduleAppointment | null>(null);
  const [createOpen, setCreateOpen] = useActionDialog();
  const [items, setItems] = useState(appointments);

  const handleVisibleDayChange = useCallback((date: Date) => {
    setSelectedDate((prev) => (isSameDay(prev, date) ? prev : date));
  }, []);

  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        return date;
      }),
    [weekStart],
  );

  const startDay = days[0]!;
  const endDay = days[6]!;
  const startMonth = format(startDay, "LLLL", { locale: uk });
  const endMonth = format(endDay, "LLLL", { locale: uk });
  const monthTitle =
    startMonth === endMonth
      ? startMonth.charAt(0).toUpperCase() + startMonth.slice(1)
      : `${startMonth.charAt(0).toUpperCase() + startMonth.slice(1)} – ${endMonth}`;
  const weekRange = `${format(startDay, "d")}–${format(endDay, "d")}`;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TrainerHeader
        title={
          <h1 className="truncate text-2xl font-bold leading-9 tracking-tight">
            {monthTitle}
          </h1>
        }
        actions={
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-card"
            aria-label="Календар"
          >
            <Calendar className="size-4" />
          </button>
        }
      />

      <div className="flex shrink-0 items-center justify-between px-5 pb-2">
        <button
          type="button"
          onClick={() => setWeekStart((prev) => addWeeks(prev, -1))}
          className="flex size-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-card"
          aria-label="Попередній тиждень"
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className="text-center text-xs font-medium text-muted-foreground">
          <span className="block">{weekRange}</span>
        </p>
        <button
          type="button"
          onClick={() => setWeekStart((prev) => addWeeks(prev, 1))}
          className="flex size-9 items-center justify-center rounded-full border border-gray-100 bg-white shadow-card"
          aria-label="Наступний тиждень"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <WeekKanbanBoard
          days={days}
          appointments={items}
          onVisibleDayChange={handleVisibleDayChange}
          onOpenAppointment={setOpenAppointment}
          onBriefing={setBriefingClientId}
          onTimer={() => setTimerOpen(true)}
        />
      </div>

      <AiBriefingDrawer
        clientId={briefingClientId}
        open={!!briefingClientId}
        onOpenChange={(open) => {
          if (!open) setBriefingClientId(null);
        }}
      />

      <AppointmentCardDrawer
        appointment={openAppointment}
        open={!!openAppointment}
        onOpenChange={(next) => {
          if (!next) setOpenAppointment(null);
        }}
        onBriefing={setBriefingClientId}
        onTimer={() => setTimerOpen(true)}
      />

      <WorkoutTimer open={timerOpen} onOpenChange={setTimerOpen} />

      <CreateAppointmentDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clients={clients}
        defaultDate={selectedDate}
        onCreated={(created) => {
          setItems((prev) => [...prev, created]);
        }}
      />
    </div>
  );
}

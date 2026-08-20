"use client";

import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Play, Sparkles } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  APPOINTMENT_STATUS_LABEL,
  appointmentClientName,
  appointmentDurationLabel,
  type ScheduleAppointment,
} from "@/components/schedule/schedule-appointment";

type Props = {
  appointment: ScheduleAppointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBriefing: (clientId: string) => void;
  onTimer: () => void;
};

export function AppointmentCardDrawer({
  appointment,
  open,
  onOpenChange,
  onBriefing,
  onTimer,
}: Props) {
  const start = appointment ? new Date(appointment.startAt) : null;
  const end = appointment ? new Date(appointment.endAt) : null;
  const name = appointment ? appointmentClientName(appointment) : "";
  const programHref = appointment?.program
    ? `/programs/${appointment.program.id}`
    : "/programs";

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle
      swipeDirection="down"
    >
      <DrawerContent className="h-[88dvh] max-h-[88dvh] rounded-t-3xl border-t border-border bg-popover pb-safe">
        <DrawerTitle className="sr-only">Заняття</DrawerTitle>
        <DrawerDescription className="sr-only">
          Деталі запланованого заняття
        </DrawerDescription>

        {appointment && start && end ? (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4">
            <h2 className="text-2xl font-bold tracking-tight">{name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(start, "EEEE, d MMMM", { locale: uk })}
            </p>

            <dl className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card px-4">
              {[
                {
                  label: "Час",
                  value: `${format(start, "HH:mm")} – ${format(end, "HH:mm")}`,
                },
                {
                  label: "Тривалість",
                  value: appointmentDurationLabel(start, end),
                },
                {
                  label: "Програма",
                  value: appointment.program?.name ?? "—",
                },
                {
                  label: "Локація",
                  value: appointment.location ?? "—",
                },
                {
                  label: "Статус",
                  value:
                    APPOINTMENT_STATUS_LABEL[appointment.status] ??
                    appointment.status,
                },
                {
                  label: "Нотатки",
                  value: appointment.notes?.trim() || "—",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-3 py-3"
                >
                  <dt className="shrink-0 text-xs text-muted-foreground">
                    {row.label}
                  </dt>
                  <dd className="min-w-0 text-right text-sm font-medium">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <Badge variant="secondary" className="rounded-full">
                {APPOINTMENT_STATUS_LABEL[appointment.status] ?? appointment.status}
              </Badge>
            </div>

            <div className="mt-auto flex flex-col gap-2 pt-6">
              <Button
                className="w-full rounded-xl font-bold"
                onClick={() => onTimer()}
              >
                <Play className="size-4 fill-current" />
                Таймер
              </Button>
              <Button
                variant="secondary"
                className="w-full rounded-xl font-bold"
                onClick={() => onBriefing(appointment.client.id)}
              >
                <Sparkles className="size-4" />
                Брифінг
              </Button>
              <a
                href={programHref}
                className="flex h-9 w-full items-center justify-center rounded-xl bg-muted text-sm font-bold"
              >
                Програма
              </a>
            </div>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

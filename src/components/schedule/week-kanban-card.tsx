"use client";

import { useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { EllipsisVertical, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  APPOINTMENT_STATUS_LABEL,
  appointmentClientName,
  appointmentDurationLabel,
  type ScheduleAppointment,
} from "@/components/schedule/schedule-appointment";

type FaceProps = {
  appointment: ScheduleAppointment;
  interactive?: boolean;
  onOpen?: () => void;
  onBriefing?: () => void;
  onTimer?: () => void;
};

export function AppointmentKanbanCardFace({
  appointment,
  interactive = true,
  onOpen,
  onBriefing,
  onTimer,
}: FaceProps) {
  const start = new Date(appointment.startAt);
  const end = new Date(appointment.endAt);
  const name = appointmentClientName(appointment);
  const programHref = appointment.program
    ? `/programs/${appointment.program.id}`
    : "/programs";

  return (
    <Card
      size="sm"
      className="h-auto shrink-0 gap-0 overflow-hidden rounded-xl border-0 py-0 shadow-sm ring-1 ring-border"
    >
      <div className="flex items-start">
        <CardContent className="min-w-0 flex-1 flex flex-col gap-2 py-3">
          <p className="text-sm font-semibold text-card-foreground wrap-break-word">
            {name}
          </p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <p>
              Час: {format(start, "HH:mm")} · {appointmentDurationLabel(start, end)}
            </p>
            <p>
              Програма:{" "}
              {appointment.program?.name ?? appointment.notes ?? "Тренування"}
            </p>
            {appointment.location ? <p>Локація: {appointment.location}</p> : null}
          </div>
          <Badge
            variant="secondary"
            className="w-fit rounded-full px-2.5 text-[10px] font-bold"
          >
            {APPOINTMENT_STATUS_LABEL[appointment.status] ?? appointment.status}
          </Badge>
        </CardContent>
        <div className="shrink-0 pt-1 pr-1">
          {interactive ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground"
                    aria-label="Дії з записом"
                    onPointerDown={(e) => e.stopPropagation()}
                  />
                }
              >
                <EllipsisVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem onClick={onOpen}>Відкрити</DropdownMenuItem>
                <DropdownMenuItem onClick={onBriefing}>
                  <Sparkles className="size-4" />
                  Брифінг
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTimer}>
                  <Play className="size-4" />
                  Таймер
                </DropdownMenuItem>
                <DropdownMenuItem render={<a href={programHref} />}>
                  Програма
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="flex size-8 items-center justify-center text-muted-foreground">
              <EllipsisVertical className="size-4" />
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

type Props = {
  appointment: ScheduleAppointment;
  onOpen: () => void;
  onBriefing: () => void;
  onTimer: () => void;
};

export function WeekKanbanCard({
  appointment,
  onOpen,
  onBriefing,
  onTimer,
}: Props) {
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const suppressClickRef = useRef(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: isDragging ? undefined : CSS.Transform.toString(transform),
        transition: isDragging ? undefined : transition,
      }}
      className={cn(
        "h-auto w-full shrink-0 cursor-grab touch-pan-x touch-pan-y overflow-hidden rounded-xl active:cursor-grabbing",
        isDragging && "opacity-40",
      )}
      {...attributes}
      {...listeners}
      onPointerDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        suppressClickRef.current = false;
      }}
      onPointerMove={(e) => {
        const startPt = pointerStartRef.current;
        if (!startPt) return;
        const dx = e.clientX - startPt.x;
        const dy = e.clientY - startPt.y;
        if (dx * dx + dy * dy > 64) suppressClickRef.current = true;
      }}
      onClick={() => {
        if (isDragging || suppressClickRef.current) return;
        onOpen();
      }}
    >
      <AppointmentKanbanCardFace
        appointment={appointment}
        onOpen={onOpen}
        onBriefing={onBriefing}
        onTimer={onTimer}
      />
    </div>
  );
}

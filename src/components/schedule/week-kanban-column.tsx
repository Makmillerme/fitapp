"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { format, isToday } from "date-fns";
import { uk } from "date-fns/locale";
import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WeekKanbanCard } from "@/components/schedule/week-kanban-card";
import type { ScheduleAppointment } from "@/components/schedule/schedule-appointment";
import { cn } from "@/lib/utils";

type SnapAlign = "start" | "center" | "end";

type Props = {
  dayId: string;
  date: Date;
  snapAlign: SnapAlign;
  appointments: ScheduleAppointment[];
  onOpenAppointment: (appointment: ScheduleAppointment) => void;
  onBriefing: (clientId: string) => void;
  onTimer: () => void;
  onJumpToToday: () => void;
};

export function WeekKanbanColumn({
  dayId,
  date,
  snapAlign,
  appointments,
  onOpenAppointment,
  onBriefing,
  onTimer,
  onJumpToToday,
}: Props) {
  const { setNodeRef } = useDroppable({ id: dayId });

  return (
    <div
      ref={setNodeRef}
      data-day-id={dayId}
      className={cn(
        "flex h-full w-[calc(100%-3rem)] shrink-0 snap-always flex-col rounded-2xl bg-muted p-2",
        isToday(date) ? "border-2 border-red-500" : "border border-border",
        snapAlign === "start" && "snap-start",
        snapAlign === "center" && "snap-center",
        snapAlign === "end" && "snap-end",
      )}
    >
      <div className="flex w-full shrink-0 items-center justify-between gap-2 px-2 py-1.5">
        <div className="min-w-0">
          <p className="text-sm font-semibold capitalize text-foreground">
            {format(date, "EEEE", { locale: uk })}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(date, "d MMMM", { locale: uk })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-sm font-semibold text-primary">
            {appointments.length}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground"
                  aria-label="Дії зі списком"
                />
              }
            >
              <EllipsisVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              <DropdownMenuItem onClick={onJumpToToday}>
                Сьогодні
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain">
        <div className="flex flex-col gap-2">
          <SortableContext
            items={appointments.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            {appointments.map((item) => (
              <WeekKanbanCard
                key={item.id}
                appointment={item}
                onOpen={() => onOpenAppointment(item)}
                onBriefing={() => onBriefing(item.client.id)}
                onTimer={onTimer}
              />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { format, isSameDay, isToday } from "date-fns";
import { moveAppointmentToDay } from "@/lib/actions/appointments";
import { AppointmentKanbanCardFace } from "@/components/schedule/week-kanban-card";
import { WeekKanbanColumn } from "@/components/schedule/week-kanban-column";
import type { ScheduleAppointment } from "@/components/schedule/schedule-appointment";

type DayColumn = {
  id: string;
  date: Date;
  appointments: ScheduleAppointment[];
};

type Props = {
  days: Date[];
  appointments: ScheduleAppointment[];
  onVisibleDayChange?: (date: Date) => void;
  onOpenAppointment: (appointment: ScheduleAppointment) => void;
  onBriefing: (clientId: string) => void;
  onTimer: () => void;
};

function dayId(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function buildColumns(days: Date[], appointments: ScheduleAppointment[]): DayColumn[] {
  return days.map((date) => ({
    id: dayId(date),
    date,
    appointments: appointments
      .filter((item) => isSameDay(new Date(item.startAt), date))
      .sort((a, b) => a.startAt.localeCompare(b.startAt)),
  }));
}

const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) {
    return pointer;
  }
  const rect = rectIntersection(args);
  if (rect.length > 0) {
    return rect;
  }
  return closestCorners(args);
};

function columnById(columns: DayColumn[], id: string): DayColumn | null {
  return (
    columns.find((col) => col.id === id) ??
    columns.find((col) => col.appointments.some((item) => item.id === id)) ??
    null
  );
}

function moveActiveOver(
  prev: DayColumn[],
  activeId: string,
  overId: string,
): DayColumn[] {
  const from = columnById(prev, activeId);
  const to = columnById(prev, overId);
  if (!from || !to) return prev;

  const fromIndex = from.appointments.findIndex((item) => item.id === activeId);
  if (fromIndex < 0) return prev;
  const item = from.appointments[fromIndex]!;

  if (from.id === to.id) {
    const overIndex = to.appointments.findIndex((entry) => entry.id === overId);
    if (overIndex < 0 || overIndex === fromIndex) return prev;
    return prev.map((col) =>
      col.id === from.id
        ? { ...col, appointments: arrayMove(col.appointments, fromIndex, overIndex) }
        : col,
    );
  }

  const overIndex = to.appointments.findIndex((entry) => entry.id === overId);
  const insertAt = overIndex >= 0 ? overIndex : to.appointments.length;

  return prev.map((col) => {
    if (col.id === from.id) {
      return {
        ...col,
        appointments: col.appointments.filter((entry) => entry.id !== activeId),
      };
    }
    if (col.id === to.id) {
      const next = col.appointments.filter((entry) => entry.id !== activeId);
      next.splice(insertAt, 0, item);
      return { ...col, appointments: next };
    }
    return col;
  });
}

function visibleDayId(scroller: HTMLElement): string | null {
  const cols = Array.from(scroller.querySelectorAll<HTMLElement>("[data-day-id]"));
  if (cols.length === 0) return null;
  const scrollerRect = scroller.getBoundingClientRect();
  const centerX = scrollerRect.left + scrollerRect.width / 2;
  let bestId: string | null = null;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const col of cols) {
    const id = col.dataset.dayId;
    if (!id) continue;
    const rect = col.getBoundingClientRect();
    const dist = Math.abs(rect.left + rect.width / 2 - centerX);
    if (dist < bestDist) {
      bestDist = dist;
      bestId = id;
    }
  }
  return bestId;
}

export function WeekKanbanBoard({
  days,
  appointments,
  onVisibleDayChange,
  onOpenAppointment,
  onBriefing,
  onTimer,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lastScrollTargetRef = useRef<string | null>(null);
  const originDayRef = useRef<string | null>(null);
  const lastVisibleDayRef = useRef<string | null>(null);
  const onVisibleDayChangeRef = useRef(onVisibleDayChange);
  onVisibleDayChangeRef.current = onVisibleDayChange;
  const [columns, setColumns] = useState(() => buildColumns(days, appointments));
  const [activeItem, setActiveItem] = useState<ScheduleAppointment | null>(null);
  const [overlayWidth, setOverlayWidth] = useState<number | null>(null);

  const daysKey = days.map((d) => dayId(d)).join("|");
  const appointmentsKey = appointments.map((a) => `${a.id}:${a.startAt}`).join("|");

  const reportVisibleDay = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const id = visibleDayId(scroller);
    if (!id || id === lastVisibleDayRef.current) return;
    const date = days.find((day) => dayId(day) === id);
    if (!date) return;
    lastVisibleDayRef.current = id;
    onVisibleDayChangeRef.current?.(date);
  }, [days]);

  const scrollToDay = useCallback((targetId: string) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const col = scroller.querySelector<HTMLElement>(`[data-day-id="${targetId}"]`);
    if (!col) return;
    const cols = Array.from(scroller.querySelectorAll<HTMLElement>("[data-day-id]"));
    const index = cols.indexOf(col);
    const scrollerRect = scroller.getBoundingClientRect();
    const colRect = col.getBoundingClientRect();
    const colLeft = colRect.left - scrollerRect.left + scroller.scrollLeft;
    let left: number;
    if (index <= 0) {
      left = colLeft;
    } else if (index === cols.length - 1) {
      left = colLeft + col.offsetWidth - scroller.clientWidth;
    } else {
      left = colLeft + col.offsetWidth / 2 - scroller.clientWidth / 2;
    }
    scroller.scrollTo({ left, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setColumns(buildColumns(days, appointments));
  }, [daysKey, appointmentsKey, days, appointments]);

  useEffect(() => {
    const todayCol = days.find((d) => isToday(d));
    const targetId = todayCol ? dayId(todayCol) : dayId(days[0]!);
    const frame = window.requestAnimationFrame(() => scrollToDay(targetId));
    return () => window.cancelAnimationFrame(frame);
  }, [daysKey, days, scrollToDay]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const onScroll = () => {
      window.requestAnimationFrame(reportVisibleDay);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    reportVisibleDay();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [reportVisibleDay]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 14 } }),
  );

  const findColumn = (id: string): DayColumn | null => columnById(columns, id);

  const handleDragStart = (event: DragStartEvent) => {
    const column = findColumn(String(event.active.id));
    const item =
      column?.appointments.find((t) => t.id === event.active.id) ?? null;
    setActiveItem(item);
    setOverlayWidth(event.active.rect.current.initial?.width ?? null);
    originDayRef.current = column?.id ?? null;
    lastScrollTargetRef.current = column?.id ?? null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const overColumn = columnById(columns, String(over.id));
    if (overColumn && overColumn.id !== lastScrollTargetRef.current) {
      lastScrollTargetRef.current = overColumn.id;
      scrollToDay(overColumn.id);
    }

    setColumns((prev) => moveActiveOver(prev, String(active.id), String(over.id)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over } = event;
    const moving = activeItem;
    const originDay = originDayRef.current;
    setActiveItem(null);
    setOverlayWidth(null);
    originDayRef.current = null;
    if (!moving) return;

    const overColumn = over
      ? columnById(columns, String(over.id))
      : columnById(columns, moving.id);
    if (!overColumn || !originDay || originDay === overColumn.id) return;

    const durationMs =
      new Date(moving.endAt).getTime() - new Date(moving.startAt).getTime();
    const nextStart = new Date(moving.startAt);
    nextStart.setFullYear(
      overColumn.date.getFullYear(),
      overColumn.date.getMonth(),
      overColumn.date.getDate(),
    );
    const moved: ScheduleAppointment = {
      ...moving,
      startAt: nextStart.toISOString(),
      endAt: new Date(nextStart.getTime() + durationMs).toISOString(),
    };

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        appointments: col.appointments.map((item) =>
          item.id === moving.id ? moved : item,
        ),
      })),
    );

    scrollToDay(overColumn.id);

    void moveAppointmentToDay(moving.id, overColumn.id).catch(() => {
      setColumns(buildColumns(days, appointments));
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={{
        canScroll: (element) => element !== scrollerRef.current,
        layoutShiftCompensation: { x: false, y: true },
      }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveItem(null);
        setOverlayWidth(null);
        originDayRef.current = null;
        setColumns(buildColumns(days, appointments));
      }}
    >
      <div
        ref={scrollerRef}
        className="hide-scrollbar flex h-full snap-x snap-mandatory items-stretch gap-2 overflow-x-auto overflow-y-hidden overscroll-x-contain px-2 pb-4"
      >
        {columns.map((column, index) => (
          <WeekKanbanColumn
            key={column.id}
            dayId={column.id}
            date={column.date}
            snapAlign={
              index === 0 ? "start" : index === columns.length - 1 ? "end" : "center"
            }
            appointments={column.appointments}
            onOpenAppointment={onOpenAppointment}
            onBriefing={onBriefing}
            onTimer={onTimer}
            onJumpToToday={() => scrollToDay(dayId(new Date()))}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeItem ? (
          <div
            className="pointer-events-none cursor-grabbing overflow-hidden rounded-xl shadow-lg"
            style={{ width: overlayWidth ?? undefined }}
          >
            <AppointmentKanbanCardFace appointment={activeItem} interactive={false} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

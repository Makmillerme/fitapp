"use client";
import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Card } from "@/components/ui/card";
import KanbanColumn from "@/components/shadcn-space/blocks/kanban-application-01/kanban-column";
import { initialColumns } from "@/components/shadcn-space/blocks/kanban-application-01/data";
import type {
  Column,
  Task,
} from "@/components/shadcn-space/blocks/kanban-application-01/types";

const KanbanApplication = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const findColumn = (id: string): Column | null => {
    const byId = columns.find((col) => col.id === id);
    if (byId) return byId;
    return columns.find((col) => col.tasks.some((task) => task.id === id)) ?? null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const column = findColumn(event.active.id as string);
    const task = column?.tasks.find((t) => t.id === event.active.id) ?? null;
    setActiveTask(task);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeColumn = findColumn(active.id as string);
    const overColumn = findColumn(over.id as string);
    if (!activeColumn || !overColumn || activeColumn.id === overColumn.id) return;

    setColumns((prev) => {
      const activeItems = activeColumn.tasks;
      const overItems = overColumn.tasks;
      const activeIndex = activeItems.findIndex((t) => t.id === active.id);
      const activeTaskItem = activeItems[activeIndex];
      if (!activeTaskItem) return prev;

      const overIndex = overItems.findIndex((t) => t.id === over.id);
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;

      return prev.map((col) => {
        if (col.id === activeColumn.id) {
          return { ...col, tasks: activeItems.filter((t) => t.id !== active.id) };
        }
        if (col.id === overColumn.id) {
          const newTasks = [...overItems];
          newTasks.splice(insertAt, 0, activeTaskItem);
          return { ...col, tasks: newTasks };
        }
        return col;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeColumn = findColumn(active.id as string);
    const overColumn = findColumn(over.id as string);
    if (!activeColumn || !overColumn || activeColumn.id !== overColumn.id) return;

    const activeIndex = activeColumn.tasks.findIndex((t) => t.id === active.id);
    const overIndex = overColumn.tasks.findIndex((t) => t.id === over.id);
    if (overIndex === -1 || activeIndex === overIndex) return;

    setColumns((prev) =>
      prev.map((col) =>
        col.id === activeColumn.id
          ? { ...col, tasks: arrayMove(col.tasks, activeIndex, overIndex) }
          : col,
      ),
    );
  };

  const handleAddTask = (columnId: string, content: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              tasks: [
                ...col.tasks,
                {
                  id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  content,
                },
              ],
            }
          : col,
      ),
    );
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col,
      ),
    );
  };

  return (
    <Card className="w-full ring-0 py-20 rounded-none overflow-x-auto max-w-7xl mx-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 items-start w-full min-w-3xl">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="bg-card flex items-start gap-2 p-3 rounded-xl shadow-md w-72 rotate-2">
              <p className="text-sm text-card-foreground wrap-break-word">
                {activeTask.content}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </Card>
  );
};

export default KanbanApplication;

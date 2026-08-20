"use client";
import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import TaskCard from "@/components/shadcn-space/blocks/kanban-application-01/task-card";
import type { Column } from "@/components/shadcn-space/blocks/kanban-application-01/types";

type Props = {
  column: Column;
  onAddTask: (columnId: string, content: string) => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
};

const KanbanColumn = ({ column, onAddTask, onDeleteTask }: Props) => {
  const { setNodeRef } = useDroppable({ id: column.id });
  const [isAdding, setIsAdding] = useState(false);
  const [value, setValue] = useState("");
  const Icon = column.icon;

  const commitAdd = () => {
    if (value.trim()) {
      onAddTask(column.id, value.trim());
    }
    setValue("");
    setIsAdding(false);
  };

  return (
    <div className="bg-muted border border-border flex flex-1 flex-col items-start min-w-0 p-2 rounded-2xl">
      <div className="flex flex-col gap-2 items-start shrink-0 w-full">
        <div className="flex items-center justify-center px-2 py-1.5 shrink-0 w-full">
          <div className="flex flex-1 gap-2 items-center min-w-0">
            <div className="flex gap-2 items-center shrink-0">
              <Icon size={16} className={column.iconClassName} />
              <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {column.title}
              </p>
            </div>
            <p className="text-xs text-muted-foreground whitespace-nowrap">
              {String(column.tasks.length).padStart(2, "0")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>

        <div
          ref={setNodeRef}
          className="flex flex-col gap-2 items-start shrink-0 w-full min-h-2"
        >
          <SortableContext
            items={column.tasks.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onDelete={() => onDeleteTask(column.id, task.id)}
              />
            ))}
          </SortableContext>

          {isAdding && (
            <Input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitAdd();
                if (e.key === "Escape") {
                  setValue("");
                  setIsAdding(false);
                }
              }}
              onBlur={commitAdd}
              placeholder="Task title"
              className="bg-card text-sm shadow-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanColumn;

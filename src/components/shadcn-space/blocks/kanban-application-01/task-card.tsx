"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { Task } from "@/components/shadcn-space/blocks/kanban-application-01/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  task: Task;
  onDelete: () => void;
};

const TaskCard = ({ task, onDelete }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group bg-card flex items-start justify-between gap-2 p-3 rounded-xl shadow-sm w-full cursor-grab active:cursor-grabbing touch-none",
        isDragging && "opacity-40",
      )}
    >
      <p className="text-sm text-card-foreground wrap-break-word">{task.content}</p>
      <Button
        variant="link"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onDelete}
        size="icon-xs"
        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 shrink-0 transition-opacity"
      >
        <Trash2 size={14} className="size-4!" />
      </Button>
    </div>
  );
};

export default TaskCard;

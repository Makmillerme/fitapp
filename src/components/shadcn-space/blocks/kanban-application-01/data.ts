import { Circle, CircleCheck, CircleDot, CircleEllipsis } from "lucide-react";
import type { Column } from "@/components/shadcn-space/blocks/kanban-application-01/types";

export const initialColumns: Column[] = [
  {
    id: "todo",
    title: "To Do",
    icon: Circle,
    iconClassName: "text-muted-foreground fill-muted-foreground size-2!",
    tasks: [
      { id: "task-1", content: "Configure Shadcn & Tailwind" },
      { id: "task-2", content: "Design drag-and-drop" },
      { id: "task-3", content: "Implement dark mode" },
    ],
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: CircleDot,
    iconClassName: "text-orange-400",
    tasks: [
      { id: "task-4", content: "Animate card drops" },
      { id: "task-5", content: "Sync state to local storage" },
    ],
  },
  {
    id: "in-review",
    title: "In Review",
    icon: CircleEllipsis,
    iconClassName: "text-purple-500",
    tasks: [
      { id: "task-9", content: "Design drag-and-drop" },
      { id: "task-10", content: "Animate card drops" },
    ],
  },
  {
    id: "done",
    title: "Done",
    icon: CircleCheck,
    iconClassName: "text-blue-500",
    tasks: [
      { id: "task-6", content: "Add Auth.js middleware" },
      { id: "task-7", content: "Scaffold sidebar layout" },
      { id: "task-8", content: "Init Next.js TS project" },
    ],
  },
];

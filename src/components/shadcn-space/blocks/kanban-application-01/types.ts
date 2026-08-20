import type { LucideIcon } from "lucide-react";

export type Task = {
  id: string;
  content: string;
};

export type Column = {
  id: string;
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  tasks: Task[];
};

import type { ComponentType } from "react";
import { Timer, type LucideIcon } from "lucide-react";

export type WidgetApp = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
  available: boolean;
  /** Optional inline component for simple widgets; nested routes use dedicated pages */
  Component?: ComponentType;
};

export const WIDGET_APPS: WidgetApp[] = [
  {
    id: "smart-timer",
    label: "SmartTimer",
    description: "AMRAP, Tabata та інші таймери для тренувань",
    icon: Timer,
    href: "/apps/smart-timer",
    available: true,
  },
];

export function getWidgetById(id: string) {
  return WIDGET_APPS.find((widget) => widget.id === id);
}

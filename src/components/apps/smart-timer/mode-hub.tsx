"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Flame,
  Repeat,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  {
    id: "amrap",
    label: "AMRAP",
    description: "Максимум раундів за час",
    href: "/apps/smart-timer/amrap",
    icon: Flame,
  },
  {
    id: "for-time",
    label: "За часом",
    description: "Якнайшвидше на результат",
    href: "/apps/smart-timer/for-time",
    icon: Clock,
  },
  {
    id: "emom",
    label: "EMOM",
    description: "Кожну хвилину на хвилину",
    href: "/apps/smart-timer/emom",
    icon: Repeat,
  },
  {
    id: "tabata",
    label: "TABATA",
    description: "Інтервали робота / відпочинок",
    href: "/apps/smart-timer/tabata",
    icon: Timer,
  },
] as const;

export function ModeHub() {
  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <header className="flex items-center gap-3 px-4 pb-2 pt-5">
        <Link
          href="/apps"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95"
          aria-label="Назад до додатків"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0 flex-1 pr-10">
          <p className="text-xl font-bold tracking-tight">SmartTimer</p>
          <p className="text-xs font-medium text-muted-foreground">
            Оберіть режим тренування
          </p>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-10 pt-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link key={mode.id} href={mode.href} className="block">
              <div
                className={cn(
                  "flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-transform active:scale-[0.98]",
                )}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-semibold">{mode.label}</span>
                  <p className="text-sm text-muted-foreground">{mode.description}</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { Flag, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  running: boolean;
  /** Show lap/flag control (AMRAP / For Time). Hidden for Tabata/EMOM. */
  showLap?: boolean;
  lapCount?: number;
  onLap?: () => void;
  onTogglePause: () => void;
  onReset: () => void;
  /** Prep: play = skip prep / start */
  primaryLabel?: string;
  className?: string;
};

export function TimerRunControls({
  running,
  showLap = false,
  lapCount = 0,
  onLap,
  onTogglePause,
  onReset,
  primaryLabel,
  className,
}: Props) {
  return (
    <div className={cn("flex w-full max-w-sm items-end justify-center gap-8", className)}>
      {showLap ? (
        <div className="flex w-16 flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={onLap}
            className="flex size-14 items-center justify-center rounded-full bg-muted text-foreground shadow-card transition-transform active:scale-90"
            aria-label="Зафіксувати раунд"
          >
            <Flag className="size-5 fill-current" />
          </button>
          <span className="text-[10px] font-medium text-muted-foreground">
            коло {lapCount}
          </span>
        </div>
      ) : (
        <div className="w-16" aria-hidden />
      )}

      <button
        type="button"
        onClick={onTogglePause}
        className="flex size-[4.5rem] items-center justify-center rounded-full bg-primary text-white shadow-float transition-transform active:scale-90"
        aria-label={primaryLabel ?? (running ? "Пауза" : "Продовжити")}
      >
        {running ? (
          <Pause className="size-8 fill-current" />
        ) : (
          <Play className="size-8 fill-current" />
        )}
      </button>

      <div className="flex w-16 flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={onReset}
          className="flex size-14 items-center justify-center rounded-full border border-foreground/15 bg-white text-foreground shadow-card transition-transform active:scale-90"
          aria-label="Скинути"
        >
          <RotateCcw className="size-5" />
        </button>
        <span className="text-[10px] font-medium text-muted-foreground">скинути</span>
      </div>
    </div>
  );
}

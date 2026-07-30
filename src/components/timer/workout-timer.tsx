"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Pause, Play, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalSeconds?: number;
  rounds?: number;
  title?: string;
  subtitle?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function WorkoutTimer({
  open,
  onOpenChange,
  totalSeconds = 12 * 60,
  rounds = 12,
  title = "EMOM 12 min",
  subtitle = "Бурпі + Свінги",
}: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(false);
  const [ms, setMs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setRemaining(totalSeconds);
      setRunning(false);
      setMs(0);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    }
  }, [open, totalSeconds]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setMs((prev) => {
        if (prev <= 0) {
          setRemaining((r) => Math.max(0, r - 1));
          return 99;
        }
        return prev - 1;
      });
    }, 10);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (remaining === 0) setRunning(false);
  }, [remaining]);

  if (!open) return null;

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const elapsed = totalSeconds - remaining;
  const currentRound = Math.min(rounds, Math.floor(elapsed / 60) + 1);

  return (
    <div
      className={cn(
        "absolute inset-0 z-[60] flex flex-col overflow-y-auto bg-white transition-opacity",
      )}
    >
      <div className="relative flex min-h-full w-full flex-col items-center justify-between pb-safe pt-12">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-20 flex size-10 items-center justify-center rounded-full bg-muted text-foreground transition-transform active:scale-90"
          aria-label="Закрити"
        >
          <X className="size-5" />
        </button>

        <div className="mt-8 text-center">
          <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-primary">
            Поточний комплекс
          </span>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
        </div>

        <div className="relative my-auto flex size-[280px] shrink-0 items-center justify-center">
          <svg className="absolute inset-0 size-full text-gray-200" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="1 4"
            />
          </svg>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex items-baseline justify-center font-mono text-[4.5rem] font-bold leading-none tracking-tighter">
              <span>{pad(minutes)}</span>
              <span className="mx-0.5 text-primary">:</span>
              <span className="text-primary">{pad(seconds)}</span>
              <span className="ml-1 text-xl text-primary opacity-80">,{pad(ms)}</span>
            </div>
            <div className="mt-4 rounded-full bg-muted px-3 py-1 text-sm font-bold text-muted-foreground">
              Раунд {currentRound}/{rounds}
            </div>
          </div>

          {running ? <div className="timer-pulse" /> : null}
        </div>

        <div className="mb-12 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => {
              setRemaining(totalSeconds);
              setMs(0);
              setRunning(false);
            }}
            className="flex size-14 items-center justify-center rounded-full bg-muted text-xl text-foreground transition-transform active:scale-90"
            aria-label="Скинути"
          >
            <RotateCcw className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => setRunning((v) => !v)}
            className="relative z-10 flex size-20 items-center justify-center rounded-full bg-primary text-3xl text-white shadow-float transition-transform active:scale-90"
            aria-label={running ? "Пауза" : "Старт"}
          >
            {running ? (
              <Pause className="size-8 fill-current" />
            ) : (
              <Play className="size-8 fill-current" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setRunning(false);
              onOpenChange(false);
            }}
            className="flex size-14 items-center justify-center rounded-full bg-muted text-xl text-foreground transition-transform active:scale-90"
            aria-label="Завершити"
          >
            <Check className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

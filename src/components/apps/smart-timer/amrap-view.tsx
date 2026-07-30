"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { ConfigShell } from "@/components/apps/smart-timer/config-shell";
import { DurationPicker } from "@/components/apps/smart-timer/duration-picker";
import { TimerDial } from "@/components/apps/smart-timer/timer-dial";
import { TimerRunControls } from "@/components/apps/smart-timer/timer-run-controls";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAmrapTimer } from "@/hooks/use-amrap-timer";
import { AMRAP_MINUTE_PRESETS } from "@/lib/timer/smart-timer-types";
import { formatMinutesLabel } from "@/lib/timer/format";
import { cn } from "@/lib/utils";

export function AmrapView() {
  const router = useRouter();
  const {
    config,
    setConfig,
    phase,
    remainingSeconds,
    remainingMs,
    elapsedMs,
    rounds,
    isInPrep,
    start,
    skipPrep,
    pause,
    resume,
    reset,
    incrementRounds,
  } = useAmrapTimer();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const isActive = phase !== "idle";

  const handleBack = () => {
    if (phase === "running" || phase === "prep" || phase === "paused") {
      pause();
      setExitOpen(true);
      return;
    }
    if (phase === "done") {
      reset();
    }
    router.push("/apps/smart-timer");
  };

  if (isActive) {
    const needleElapsed = isInPrep || phase === "done" ? 0 : elapsedMs;
    const isRunning = phase === "running" || phase === "prep";

    return (
      <div className="flex h-full flex-col bg-[#FAFAFA]">
        <header className="relative px-4 pb-2 pt-5">
          <button
            type="button"
            onClick={handleBack}
            className="relative z-10 flex size-10 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft className="size-4" />
          </button>
          <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-bold uppercase tracking-[0.18em]">
            AMRAP
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5 pb-10">
          <p className="text-lg font-semibold text-foreground">
            {isInPrep ? "Підготовка" : formatMinutesLabel(config.durationSeconds)}
          </p>

          <TimerDial
            size={300}
            elapsedMs={needleElapsed}
            displaySeconds={phase === "done" ? 0 : remainingSeconds}
            displayMs={
              !isInPrep && (phase === "running" || phase === "paused")
                ? remainingMs
                : undefined
            }
            readoutPlacement={isInPrep || phase === "done" ? "none" : "below"}
            overlayContent={
              isInPrep ? (
                <div className="flex flex-col items-center">
                  <span className="font-mono text-5xl font-bold tracking-tighter text-primary">
                    {remainingSeconds}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground">
                    {phase === "paused" ? "Пауза" : "Старт через…"}
                  </span>
                </div>
              ) : phase === "done" ? (
                <div className="flex flex-col items-center gap-2">
                  <Check className="size-10 text-primary" />
                  <span className="text-sm font-semibold">Готово</span>
                  <span className="text-xs text-muted-foreground">{rounds} раундів</span>
                </div>
              ) : null
            }
          />

          {phase === "done" ? (
            <Button type="button" className="mt-2 h-12 rounded-full px-8" onClick={reset}>
              Нове AMRAP
            </Button>
          ) : (
            <TimerRunControls
              running={isRunning}
              showLap={!isInPrep}
              lapCount={rounds}
              onLap={incrementRounds}
              onTogglePause={() => {
                if (phase === "prep") {
                  skipPrep();
                  return;
                }
                if (phase === "running") pause();
                else resume();
              }}
              onReset={reset}
              primaryLabel={
                phase === "prep"
                  ? "Пропустити підготовку"
                  : phase === "paused"
                    ? "Продовжити"
                    : "Пауза"
              }
            />
          )}
        </div>

        <Dialog open={exitOpen} onOpenChange={setExitOpen}>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Вийти з таймера?</DialogTitle>
              <DialogDescription>
                Поточний прогрес буде скинуто.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:justify-stretch">
              <Button
                type="button"
                variant="outline"
                className="sm:flex-1"
                onClick={() => {
                  setExitOpen(false);
                  resume();
                }}
              >
                Продовжити
              </Button>
              <Button
                type="button"
                className="sm:flex-1"
                onClick={() => {
                  setExitOpen(false);
                  reset();
                  router.push("/apps/smart-timer");
                }}
              >
                Вийти
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <>
      <ConfigShell
        title="AMRAP"
        subtitle="Максимально можлива кількість раундів за час"
        onStart={start}
      >
        <div className="mb-6 flex justify-center">
          <TimerDial
            size={260}
            elapsedMs={0}
            displaySeconds={config.durationSeconds}
            readoutPlacement="none"
          />
        </div>

        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "mx-auto flex w-full max-w-xs items-center justify-center gap-3 rounded-2xl border-2 border-primary bg-white px-4 py-4 shadow-card transition-transform active:scale-[0.98]",
          )}
        >
          <span className="font-mono text-3xl font-bold text-foreground">
            {Math.round(config.durationSeconds / 60)}
          </span>
          <span className="text-base font-medium text-muted-foreground">хвилин</span>
        </button>
      </ConfigShell>

      <DurationPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        valueSeconds={config.durationSeconds}
        mode="minutes"
        title="Тривалість AMRAP"
        presets={AMRAP_MINUTE_PRESETS.map((m) => m * 60)}
        minSeconds={60}
        maxSeconds={3600}
        onConfirm={(seconds) => setConfig({ durationSeconds: seconds })}
      />
    </>
  );
}

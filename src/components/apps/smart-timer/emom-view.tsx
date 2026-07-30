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
import { useEmomTimer } from "@/hooks/use-emom-timer";
import { DURATION_PRESETS_SECONDS } from "@/lib/timer/smart-timer-types";
import { formatClock } from "@/lib/timer/format";

type PickerTarget = "interval" | "duration" | null;

export function EmomView() {
  const router = useRouter();
  const {
    config,
    setConfig,
    phase,
    elapsedMs,
    remainingMs,
    remainingSeconds,
    prepRemainingSeconds,
    isInPrep,
    currentRound,
    totalRounds,
    nextIntervalInSeconds,
    start,
    skipPrep,
    pause,
    resume,
    reset,
  } = useEmomTimer();

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [exitOpen, setExitOpen] = useState(false);

  const isActive = phase !== "idle";

  const handleBack = () => {
    if (phase === "running" || phase === "prep" || phase === "paused") {
      pause();
      setExitOpen(true);
      return;
    }
    if (phase === "done") reset();
    router.push("/apps/smart-timer");
  };

  if (isActive) {
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
            EMOM
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-5 pb-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {isInPrep ? "Підготовка" : phase === "done" ? "Готово" : "Робота"}
            </p>
            {!isInPrep ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Раунд {currentRound} / {totalRounds} · Наступний через {formatClock(nextIntervalInSeconds)}
              </p>
            ) : null}
          </div>

          <TimerDial
            size={300}
            elapsedMs={isInPrep || phase === "done" ? 0 : elapsedMs}
            displaySeconds={isInPrep ? prepRemainingSeconds : remainingSeconds}
            displayMs={!isInPrep && phase !== "done" ? remainingMs : undefined}
            readoutPlacement={isInPrep || phase === "done" ? "none" : "below"}
            overlayContent={
              isInPrep ? (
                <div className="flex flex-col items-center">
                  <span className="font-mono text-5xl font-bold tracking-tighter text-primary">
                    {prepRemainingSeconds}
                  </span>
                  <span className="mt-1 text-xs font-medium text-muted-foreground">
                    {phase === "paused" ? "Пауза" : "Старт через…"}
                  </span>
                </div>
              ) : phase === "done" ? (
                <div className="flex flex-col items-center gap-2">
                  <Check className="size-10 text-primary" />
                  <span className="text-sm font-semibold">Готово</span>
                </div>
              ) : null
            }
          />

          {phase === "done" ? (
            <Button type="button" className="h-12 rounded-full px-8" onClick={reset}>
              Новий запуск
            </Button>
          ) : (
            <TimerRunControls
              running={isRunning}
              showLap={false}
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
        title="EMOM"
        subtitle={`Кожні ${formatClock(config.intervalSeconds)} протягом ${formatClock(config.durationSeconds)}`}
        ctaSubLabel={`Загальний час: ${formatClock(config.durationSeconds)}`}
        onStart={start}
      >
        <div className="mb-5 flex justify-center">
          <TimerDial
            size={220}
            elapsedMs={0}
            displaySeconds={config.intervalSeconds}
            readoutPlacement="below"
            caption="Інтервал"
          />
        </div>

        <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPickerTarget("interval")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="font-mono text-2xl font-bold leading-none">
              {formatClock(config.intervalSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Кожні</div>
          </button>

          <button
            type="button"
            onClick={() => setPickerTarget("duration")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="font-mono text-2xl font-bold leading-none">
              {formatClock(config.durationSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Протягом</div>
          </button>
        </div>
      </ConfigShell>

      <DurationPicker
        open={pickerTarget != null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null);
        }}
        valueSeconds={
          pickerTarget === "duration" ? config.durationSeconds : config.intervalSeconds
        }
        title={pickerTarget === "duration" ? "Загальний час" : "Інтервал"}
        mode="seconds"
        presets={DURATION_PRESETS_SECONDS}
        minSeconds={pickerTarget === "duration" ? 60 : 10}
        maxSeconds={7200}
        onConfirm={(value) => {
          if (pickerTarget === "duration") {
            setConfig({ ...config, durationSeconds: value });
          } else {
            setConfig({ ...config, intervalSeconds: value });
          }
          setPickerTarget(null);
        }}
      />
    </>
  );
}

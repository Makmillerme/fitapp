"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, SkipForward } from "lucide-react";
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
import { useTabataTimer } from "@/hooks/use-tabata-timer";
import { DURATION_PRESETS_SECONDS } from "@/lib/timer/smart-timer-types";
import { formatClock } from "@/lib/timer/format";

type PickerTarget = "rounds" | "work" | "rest" | null;

const ROUND_PRESETS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export function TabataView() {
  const router = useRouter();
  const {
    config,
    setConfig,
    totalSeconds,
    phase,
    round,
    remainingSeconds,
    remainingMs,
    elapsedMs,
    isInPrep,
    start,
    skipPrep,
    pause,
    resume,
    reset,
    skip,
  } = useTabataTimer();

  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  const [exitOpen, setExitOpen] = useState(false);

  const isActive = phase !== "idle";

  const handleBack = () => {
    if (phase === "work" || phase === "rest" || phase === "prep" || phase === "paused") {
      pause();
      setExitOpen(true);
      return;
    }
    if (phase === "done") reset();
    router.push("/apps/smart-timer");
  };

  if (isActive) {
    const phaseLabel = isInPrep
      ? "Підготовка"
      : phase === "done"
        ? "Готово"
        : phase === "paused"
          ? "Пауза"
          : phase === "work"
            ? "Робота"
            : "Відпочинок";

    const needleElapsed = isInPrep || phase === "done" ? 0 : elapsedMs;
    const isRunning = phase === "work" || phase === "rest" || phase === "prep";

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
            TABATA
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 pb-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {phaseLabel}
            </p>
            {!isInPrep && phase !== "done" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Раунд {round} / {config.rounds}
              </p>
            ) : null}
            {phase === "done" ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {config.rounds} раундів завершено
              </p>
            ) : null}
          </div>

          <TimerDial
            size={300}
            elapsedMs={needleElapsed}
            displaySeconds={phase === "done" ? 0 : remainingSeconds}
            displayMs={
              !isInPrep &&
              (phase === "work" || phase === "rest" || phase === "paused")
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
                </div>
              ) : null
            }
          />

          {phase === "done" ? (
            <Button type="button" className="h-12 rounded-full px-8" onClick={reset}>
              Нове Tabata
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <TimerRunControls
                running={isRunning}
                showLap={false}
                onTogglePause={() => {
                  if (phase === "prep") {
                    skipPrep();
                    return;
                  }
                  if (phase === "work" || phase === "rest") pause();
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
              {!isInPrep ? (
                <button
                  type="button"
                  onClick={skip}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors active:text-foreground"
                >
                  <SkipForward className="size-4" />
                  Пропустити фазу
                </button>
              ) : null}
            </div>
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
        title="TABATA"
        subtitle="Встановіть свій таймер Табата"
        ctaSubLabel={`Загальний час: ${formatClock(totalSeconds)}`}
        onStart={start}
      >
        <div className="mb-5 flex justify-center">
          <TimerDial
            size={220}
            elapsedMs={0}
            displaySeconds={config.workSeconds}
            readoutPlacement="below"
            caption="Робота"
          />
        </div>

        <div className="mx-auto grid w-full max-w-sm grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPickerTarget("rounds")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="font-mono text-2xl font-bold leading-none">{config.rounds}</div>
            <div className="mt-1 text-xs text-muted-foreground">Раунди</div>
          </button>

          <button
            type="button"
            onClick={() => setPickerTarget("work")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="font-mono text-2xl font-bold leading-none">
              {formatClock(config.workSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Робота</div>
          </button>

          <button
            type="button"
            onClick={() => setPickerTarget("rest")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="font-mono text-2xl font-bold leading-none">
              {formatClock(config.restSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Відпочинок</div>
          </button>
        </div>
      </ConfigShell>

      <DurationPicker
        open={pickerTarget != null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null);
        }}
        valueSeconds={
          pickerTarget === "rounds"
            ? config.rounds
            : pickerTarget === "rest"
              ? config.restSeconds
              : config.workSeconds
        }
        title={
          pickerTarget === "rounds"
            ? "Кількість раундів"
            : pickerTarget === "rest"
              ? "Час відпочинку"
              : "Час роботи"
        }
        mode={pickerTarget === "rounds" ? "count" : "seconds"}
        presets={pickerTarget === "rounds" ? ROUND_PRESETS : DURATION_PRESETS_SECONDS}
        minSeconds={pickerTarget === "rounds" ? 1 : 5}
        maxSeconds={pickerTarget === "rounds" ? 99 : pickerTarget === "rest" ? 300 : 600}
        onConfirm={(value) => {
          if (pickerTarget === "rounds") {
            setConfig({ ...config, rounds: value });
          } else if (pickerTarget === "rest") {
            setConfig({ ...config, restSeconds: value });
          } else {
            setConfig({ ...config, workSeconds: value });
          }
          setPickerTarget(null);
        }}
      />
    </>
  );
}

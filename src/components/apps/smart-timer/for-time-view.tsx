"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForTimeTimer } from "@/hooks/use-for-time-timer";
import { DURATION_PRESETS_SECONDS } from "@/lib/timer/smart-timer-types";
import { formatClock, formatStopwatchParts } from "@/lib/timer/format";

type PickerTarget = "cap" | null;

function formatMs(ms: number) {
  const p = formatStopwatchParts(ms);
  return `${p.mm}:${p.ss},${p.cs}`;
}

export function ForTimeView() {
  const router = useRouter();
  const {
    config,
    setConfig,
    phase,
    elapsedMs,
    elapsedSeconds,
    prepRemainingSeconds,
    capRemainingSeconds,
    isInPrep,
    laps,
    start,
    skipPrep,
    pause,
    resume,
    reset,
    addLap,
  } = useForTimeTimer();

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

  const lapRows = useMemo(() => laps.slice(0, 6), [laps]);

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
            ЗА ЧАСОМ
          </h1>
        </header>

        <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto px-5 pb-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {isInPrep ? "Підготовка" : phase === "done" ? "Готово" : "Робота"}
            </p>
            {config.capEnabled && !isInPrep ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Ліміт: {formatClock(config.capSeconds)} · Залишилось {formatClock(capRemainingSeconds)}
              </p>
            ) : null}
          </div>

          <TimerDial
            size={300}
            elapsedMs={isInPrep || phase === "done" ? 0 : elapsedMs}
            displaySeconds={isInPrep ? prepRemainingSeconds : elapsedSeconds}
            displayMs={!isInPrep && phase !== "done" ? elapsedMs : undefined}
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
              showLap={!isInPrep}
              lapCount={laps.length}
              onLap={addLap}
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

          {lapRows.length > 0 ? (
            <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-card">
              <div className="grid grid-cols-3 gap-2 border-b border-border/60 px-4 py-2 text-xs font-semibold text-muted-foreground">
                <span>Коло</span>
                <span>Відрізок</span>
                <span>Всього</span>
              </div>
              {lapRows.map((lap) => (
                <div key={lap.id} className="grid grid-cols-3 gap-2 px-4 py-2.5 text-sm">
                  <span>{String(lap.id).padStart(2, "0")}</span>
                  <span>+{formatMs(lap.lapMs)}</span>
                  <span>{formatMs(lap.totalMs)}</span>
                </div>
              ))}
            </div>
          ) : null}
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
        title="За часом"
        subtitle="Максимально швидко, наскільки це можливо"
        ctaSubLabel={
          config.capEnabled ? `Ліміт: ${formatClock(config.capSeconds)}` : "Без обмеження"
        }
        onStart={start}
      >
        <div className="mb-5 flex justify-center">
          <TimerDial
            size={220}
            elapsedMs={0}
            displaySeconds={0}
            readoutPlacement="below"
            caption={config.capEnabled ? "З лімітом" : "Без ліміту"}
          />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
          <Tabs
            value={config.capEnabled ? "cap" : "free"}
            onValueChange={(value) =>
              setConfig({ ...config, capEnabled: value === "cap" })
            }
            className="w-full"
          >
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-white p-1 shadow-card">
              <TabsTrigger value="free" className="rounded-lg text-sm font-semibold">
                Без ліміту
              </TabsTrigger>
              <TabsTrigger value="cap" className="rounded-lg text-sm font-semibold">
                Ліміт часу
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <button
            type="button"
            disabled={!config.capEnabled}
            onClick={() => setPickerTarget("cap")}
            className="rounded-xl border-2 border-primary bg-white px-2 py-3 text-center shadow-card transition-transform active:scale-[0.99] disabled:opacity-50"
          >
            <div className="font-mono text-2xl font-bold leading-none">
              {formatClock(config.capSeconds)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Ліміт часу</div>
          </button>
        </div>
      </ConfigShell>

      <DurationPicker
        open={pickerTarget != null}
        onOpenChange={(open) => {
          if (!open) setPickerTarget(null);
        }}
        valueSeconds={config.capSeconds}
        title="Ліміт часу"
        mode="seconds"
        presets={DURATION_PRESETS_SECONDS}
        minSeconds={60}
        maxSeconds={7200}
        onConfirm={(seconds) => {
          setConfig({ ...config, capSeconds: seconds });
          setPickerTarget(null);
        }}
      />
    </>
  );
}

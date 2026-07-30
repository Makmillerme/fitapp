"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  formatClock,
  formatDurationLabel,
  splitSeconds,
  toSeconds,
} from "@/lib/timer/format";
import { cn } from "@/lib/utils";

type Mode = "seconds" | "minutes" | "count";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  valueSeconds: number;
  onConfirm: (seconds: number) => void;
  title?: string;
  mode?: Mode;
  presets?: readonly number[];
  minSeconds?: number;
  maxSeconds?: number;
};

export function DurationPicker({
  open,
  onOpenChange,
  valueSeconds,
  onConfirm,
  title = "Оберіть час",
  mode = "seconds",
  presets,
  minSeconds = 5,
  maxSeconds = 3600,
}: Props) {
  const [draft, setDraft] = useState(valueSeconds);
  const [custom, setCustom] = useState(false);
  const [customMin, setCustomMin] = useState(0);
  const [customSec, setCustomSec] = useState(0);
  const [customCount, setCustomCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    setDraft(valueSeconds);
    setCustom(false);
    const { minutes, seconds } = splitSeconds(valueSeconds);
    setCustomMin(minutes);
    setCustomSec(seconds);
    setCustomCount(Math.max(1, valueSeconds));
  }, [open, valueSeconds]);

  const list =
    presets ??
    (mode === "minutes"
      ? ([5, 8, 10, 12, 15, 20, 30] as const).map((m) => m * 60)
      : mode === "count"
        ? ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const)
        : ([10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300] as const));

  const applyCustom = () => {
    if (mode === "count") {
      const value = Number.isFinite(customCount) ? customCount : 1;
      const clamped = Math.min(maxSeconds, Math.max(minSeconds, value));
      setDraft(clamped);
      setCustom(false);
      return;
    }

    const total =
      mode === "minutes"
        ? toSeconds(customMin, 0)
        : toSeconds(customMin, customSec);
    const clamped = Math.min(maxSeconds, Math.max(minSeconds, total));
    setDraft(clamped);
    setCustom(false);
  };

  const labelForValue = (sec: number) => {
    if (mode === "count") return `${sec}`;
    if (mode === "minutes") return formatDurationLabel(sec);
    return sec % 60 === 0 && sec >= 60 ? formatDurationLabel(sec) : formatClock(sec);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>

        {custom ? (
          <div className="flex flex-col gap-4 px-4 py-2">
            {mode === "count" ? (
              <div className="space-y-1.5">
                <Label>Значення</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={minSeconds}
                  max={maxSeconds}
                  value={customCount}
                  onChange={(e) => setCustomCount(Number(e.target.value) || minSeconds)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Хв</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={59}
                    value={customMin}
                    onChange={(e) => setCustomMin(Number(e.target.value) || 0)}
                  />
                </div>
                {mode === "seconds" ? (
                  <div className="space-y-1.5">
                    <Label>Сек</Label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={59}
                      value={customSec}
                      onChange={(e) => setCustomSec(Number(e.target.value) || 0)}
                    />
                  </div>
                ) : (
                  <div className="flex items-end pb-2 text-sm text-muted-foreground">хвилин</div>
                )}
              </div>
            )}

            <Button type="button" variant="outline" onClick={applyCustom}>
              Застосувати
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-56 px-2">
            <div className="flex flex-col gap-1 px-2 py-1">
              {list.map((sec) => {
                const active = draft === sec;
                return (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setDraft(sec)}
                    className={cn(
                      "rounded-xl px-4 py-3 text-center text-base font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {labelForValue(sec)}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCustom(true)}
                className="px-4 py-3 text-center text-sm font-semibold text-primary"
              >
                Власне значення
              </button>
            </div>
          </ScrollArea>
        )}

        <DrawerFooter>
          <Button
            type="button"
            className="h-12 rounded-full text-base font-semibold"
            onClick={() => {
              onConfirm(Math.min(maxSeconds, Math.max(minSeconds, draft)));
              onOpenChange(false);
            }}
          >
            OK
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

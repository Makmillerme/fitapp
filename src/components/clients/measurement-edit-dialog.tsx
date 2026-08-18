"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertClientGeneral } from "@/lib/actions/clients";

export type MeasurementSnapshot = {
  measuredAt: string | null;
  neckCm: number | null;
  chestCm: number | null;
  waistCm: number | null;
  hipsCm: number | null;
  bicepsCm: number | null;
  shoulderCm: number | null;
  forearmCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  heightCm: number | null;
};

export type MeasurementSavePatch = {
  heightCm: number | null;
  weightKg: number | null;
  latestMeasurement?: MeasurementSnapshot;
};

const ZONE_FIELDS = [
  { key: "neckCm", label: "Шия", max: 120 },
  { key: "shoulderCm", label: "Плечі", max: 180 },
  { key: "chestCm", label: "Груди", max: 220 },
  { key: "bicepsCm", label: "Біцепс", max: 90 },
  { key: "forearmCm", label: "Передпліччя", max: 80 },
  { key: "waistCm", label: "Талія", max: 220 },
  { key: "hipsCm", label: "Таз", max: 220 },
  { key: "thighCm", label: "Стегно", max: 150 },
  { key: "calfCm", label: "Ікра", max: 90 },
] as const;

type ZoneKey = (typeof ZONE_FIELDS)[number]["key"];

type Draft = {
  measuredAt: string;
  heightCm: string;
  weightKg: string;
} & Record<ZoneKey, string>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  weightKg: number | null;
  measurements: MeasurementSnapshot;
  onSaved: (patch: MeasurementSavePatch) => void;
};

function toDateInputValue(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return format(new Date(), "yyyy-MM-dd");
  return format(date, "yyyy-MM-dd");
}

function numToDraft(value: number | null | undefined): string {
  if (value == null) return "";
  return Number.isInteger(value) ? String(value) : String(value);
}

function parsePositiveNumber(raw: string): number | undefined | "invalid" {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0) return "invalid";
  return value;
}

function emptyDraft(weightKg: number | null, measurements: MeasurementSnapshot): Draft {
  return {
    measuredAt: toDateInputValue(null),
    heightCm: numToDraft(measurements.heightCm),
    weightKg: numToDraft(weightKg),
    neckCm: numToDraft(measurements.neckCm),
    chestCm: numToDraft(measurements.chestCm),
    bicepsCm: numToDraft(measurements.bicepsCm),
    shoulderCm: numToDraft(measurements.shoulderCm),
    forearmCm: numToDraft(measurements.forearmCm),
    waistCm: numToDraft(measurements.waistCm),
    hipsCm: numToDraft(measurements.hipsCm),
    thighCm: numToDraft(measurements.thighCm),
    calfCm: numToDraft(measurements.calfCm),
  };
}

export function MeasurementEditDialog({
  open,
  onOpenChange,
  clientId,
  weightKg,
  measurements,
  onSaved,
}: Props) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(weightKg, measurements));
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setDraft(emptyDraft(weightKg, measurements));
    // Reset only when the dialog opens, not on every parent re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open is the trigger
  }, [open]);

  const zoneInputs = useMemo(
    () =>
      ZONE_FIELDS.map((field) => ({
        ...field,
        value: draft[field.key],
      })),
    [draft],
  );

  const save = () => {
    const parsedHeight = parsePositiveNumber(draft.heightCm);
    const parsedWeight = parsePositiveNumber(draft.weightKg);
    const parsedZones: Partial<Record<ZoneKey, number | undefined>> = {};
    let invalid = parsedHeight === "invalid" || parsedWeight === "invalid";

    for (const field of ZONE_FIELDS) {
      const parsed = parsePositiveNumber(draft[field.key]);
      if (parsed === "invalid") {
        invalid = true;
        break;
      }
      parsedZones[field.key] = parsed;
    }

    if (invalid) {
      toast.error("Перевірте числа: лише додатні значення");
      return;
    }

    const heightCm = parsedHeight === "invalid" ? undefined : parsedHeight;
    const weight = parsedWeight === "invalid" ? undefined : parsedWeight;
    const hasMeasurement =
      heightCm != null || ZONE_FIELDS.some((field) => parsedZones[field.key] != null);

    if (heightCm === undefined && weight === undefined && !hasMeasurement) {
      toast.error("Вкажіть хоча б одне значення");
      return;
    }

    const measuredAt = draft.measuredAt
      ? new Date(`${draft.measuredAt}T12:00:00`)
      : new Date();
    if (Number.isNaN(measuredAt.getTime())) {
      toast.error("Невірна дата заміру");
      return;
    }

    startTransition(async () => {
      try {
        const result = await upsertClientGeneral({
          clientId,
          ...(heightCm !== undefined ? { heightCm } : {}),
          ...(weight !== undefined ? { weightKg: weight } : {}),
          ...(hasMeasurement
            ? {
                measuredAt,
                measurementHeightCm: heightCm ?? null,
                neckCm: parsedZones.neckCm ?? null,
                chestCm: parsedZones.chestCm ?? null,
                bicepsCm: parsedZones.bicepsCm ?? null,
                shoulderCm: parsedZones.shoulderCm ?? null,
                forearmCm: parsedZones.forearmCm ?? null,
                waistCm: parsedZones.waistCm ?? null,
                hipsCm: parsedZones.hipsCm ?? null,
                thighCm: parsedZones.thighCm ?? null,
                calfCm: parsedZones.calfCm ?? null,
              }
            : {}),
        });

        onSaved({
          heightCm: result.client.heightCm,
          weightKg: result.client.weightKg,
          ...(result.latestMeasurement
            ? {
                latestMeasurement: {
                  measuredAt: result.latestMeasurement.measuredAt
                    ? new Date(result.latestMeasurement.measuredAt).toISOString()
                    : null,
                  neckCm: result.latestMeasurement.neckCm,
                  chestCm: result.latestMeasurement.chestCm,
                  waistCm: result.latestMeasurement.waistCm,
                  hipsCm: result.latestMeasurement.hipsCm,
                  bicepsCm: result.latestMeasurement.bicepsCm,
                  shoulderCm: result.latestMeasurement.shoulderCm,
                  forearmCm: result.latestMeasurement.forearmCm,
                  thighCm: result.latestMeasurement.thighCm,
                  calfCm: result.latestMeasurement.calfCm,
                  heightCm: result.latestMeasurement.heightCm,
                },
              }
            : {}),
        });
        toast.success("Замір збережено");
        onOpenChange(false);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Не вдалося зберегти замір");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(36rem,85dvh)] w-[min(calc(100%-2rem),24rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="shrink-0 px-5 pt-5 pb-3">
          <DialogTitle>Замір</DialogTitle>
          <DialogDescription>
            Новий знімок антропометрії. Порожні поля можна пропустити.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto hide-scrollbar px-5 pb-3">
          <div className="grid gap-1.5">
            <Label htmlFor="measurement-date">Дата</Label>
            <Input
              id="measurement-date"
              type="date"
              value={draft.measuredAt}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, measuredAt: event.target.value }))
              }
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="measurement-height">Зріст, см</Label>
              <Input
                id="measurement-height"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                max="260"
                value={draft.heightCm}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, heightCm: event.target.value }))
                }
                className="rounded-xl"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="measurement-weight">Вага, кг</Label>
              <Input
                id="measurement-weight"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                max="500"
                value={draft.weightKg}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, weightKg: event.target.value }))
                }
                className="rounded-xl"
              />
            </div>
          </div>

          {zoneInputs.map((field) => (
            <div key={field.key} className="grid gap-1.5">
              <Label htmlFor={`measurement-${field.key}`}>{field.label}, см</Label>
              <Input
                id={`measurement-${field.key}`}
                type="number"
                inputMode="decimal"
                step="0.1"
                min="1"
                max={field.max}
                value={field.value}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, [field.key]: event.target.value }))
                }
                className="rounded-xl"
              />
            </div>
          ))}
        </div>

        <DialogFooter className="-mx-0 -mb-0 shrink-0 rounded-b-2xl border-t bg-muted/35 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button type="button" disabled={pending} onClick={save}>
            Зберегти
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { SkeletonFigure } from "@/components/clients/skeleton-figure";
import { SKELETON_SUBPATHS } from "@/components/clients/skeleton-subpaths";
import { ZONE_HOLES } from "@/components/clients/skeleton-zone-map";
import {
  MeasurementEditDialog,
  type MeasurementSavePatch,
} from "@/components/clients/measurement-edit-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Measurements = {
  measuredAt?: string | null;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepsCm?: number | null;
  shoulderCm?: number | null;
  forearmCm?: number | null;
  thighCm?: number | null;
  calfCm?: number | null;
  heightCm?: number | null;
};

type BodyKey = Exclude<keyof Measurements, "measuredAt" | "heightCm">;

type Props = {
  clientId: string;
  measurements: Measurements;
  weightKg?: number | null;
  onSaved?: (patch: MeasurementSavePatch) => void;
};

const PARTS: Array<{ key: BodyKey; label: string }> = [
  { key: "neckCm", label: "Шия" },
  { key: "shoulderCm", label: "Плечі" },
  { key: "chestCm", label: "Груди" },
  { key: "bicepsCm", label: "Біцепс" },
  { key: "forearmCm", label: "Передпліччя" },
  { key: "waistCm", label: "Талія" },
  { key: "hipsCm", label: "Таз" },
  { key: "thighCm", label: "Стегно" },
  { key: "calfCm", label: "Ікра" },
];

const HEAD_Y = 82;
const FEET_Y = 955;
const RULER_X = 86;

const fmtCm = (value?: number | null) =>
  value == null ? "\u2014" : `${Number.isInteger(value) ? value : value.toFixed(1)} см`;

const fmtKg = (value?: number | null) =>
  value == null ? "\u2014" : `${Number.isInteger(value) ? value : value.toFixed(1)} кг`;

export function BodyMeasurementsCard({
  clientId,
  measurements,
  weightKg = null,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState<BodyKey | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const measuredAt = measurements.measuredAt
    ? new Date(measurements.measuredAt).toLocaleDateString("uk-UA")
    : null;

  const toggle = (key: BodyKey) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  const visibleParts = PARTS.filter(({ key }) => measurements[key] != null);
  const activeSelected =
    selected !== null && measurements[selected] != null ? selected : null;
  const showHeight = measurements.heightCm != null;
  const showWeight = weightKg != null;
  const figureTx = showHeight ? -80 : -132;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">Антропометрія</p>
        <div className="flex items-center gap-1">
          {measuredAt ? (
            <p className="text-xs text-muted-foreground">Оновлено {measuredAt}</p>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl"
            aria-label="Записати замір"
            onClick={() => setEditOpen(true)}
          >
            <Pencil />
          </Button>
        </div>
      </div>

      <div className="flex items-stretch gap-1 rounded-2xl bg-muted/40 p-2 sm:gap-2 sm:p-3">
        <svg
          viewBox="0 0 760 1088"
          className="min-w-0 flex-1"
          role="img"
          aria-label="Схема замірів тіла"
        >


          {showHeight ? (
            <>
              <line
                x1={RULER_X}
                y1={HEAD_Y}
                x2={RULER_X}
                y2={FEET_Y}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={RULER_X - 10}
                y1={HEAD_Y}
                x2={RULER_X + 10}
                y2={HEAD_Y}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={RULER_X - 10}
                y1={FEET_Y}
                x2={RULER_X + 10}
                y2={FEET_Y}
                stroke="currentColor"
                className="text-primary"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <rect
                x={RULER_X - 66}
                y={(HEAD_Y + FEET_Y) / 2 - 48}
                width="132"
                height="96"
                rx="20"
                className="fill-card"
              />
              <text
                x={RULER_X}
                y={(HEAD_Y + FEET_Y) / 2 - 2}
                textAnchor="middle"
                className="fill-primary"
                fontSize="48"
                fontWeight="800"
              >
                {fmtCm(measurements.heightCm).replace(" см", "")}
              </text>
              <text
                x={RULER_X}
                y={(HEAD_Y + FEET_Y) / 2 + 32}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="22"
                fontWeight="700"
              >
                см
              </text>
            </>
          ) : null}

          <g transform={`translate(${figureTx}, 0)`}>
            {activeSelected
              ? ZONE_HOLES[activeSelected].map((idx) => (
                  <path
                    key={`fill-${idx}`}
                    d={SKELETON_SUBPATHS[idx]}
                    fill="var(--primary)"
                    className="pointer-events-none"
                  />
                ))
              : null}

            <SkeletonFigure
              fill="currentColor"
              className="pointer-events-none text-primary"
              opacity={0.28}
            />

            {visibleParts.flatMap(({ key, label }) =>
              ZONE_HOLES[key].map((idx) => (
                <path
                  key={`hit-${idx}`}
                  d={SKELETON_SUBPATHS[idx]}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => toggle(key)}
                >
                  <title>{label}</title>
                </path>
              )),
            )}

            {showWeight ? (
              <>
                <rect
                  x={512 - 168}
                  y={990}
                  width={336}
                  height={88}
                  rx={44}
                  fill="color-mix(in oklch, var(--foreground) 12%, transparent)"
                />
                <rect
                  x={512 - 160}
                  y={984}
                  width={320}
                  height={80}
                  rx={40}
                  className="fill-card"
                  stroke="color-mix(in oklch, var(--border) 80%, transparent)"
                  strokeWidth="3"
                />
                <text
                  x="512"
                  y={1024}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-foreground"
                  fontSize="36"
                  fontWeight="800"
                >
                  {fmtKg(weightKg)}
                </text>
              </>
            ) : null}
          </g>
        </svg>

        {visibleParts.length > 0 ? (
          <div
            className="flex w-max shrink-0 flex-col items-stretch justify-center gap-1 py-1"
          >
            {visibleParts.map(({ key, label }) => {
              const active = activeSelected === key;
              return (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  aria-pressed={active}
                  onClick={() => toggle(key)}
                  className={cn(
                    "h-auto min-h-0 w-auto min-w-full flex-col items-start gap-0 rounded-xl px-2 py-1.5 text-left",
                    active && "bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-tight text-muted-foreground",
                      active && "text-primary",
                    )}
                  >
                    {label}
                  </span>
                  <span
                    className={cn(
                      "text-xs font-semibold text-foreground sm:text-sm",
                      active && "text-primary",
                    )}
                  >
                    {fmtCm(measurements[key])}
                  </span>
                </Button>
              );
            })}
          </div>
        ) : null}
      </div>

      <MeasurementEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        clientId={clientId}
        weightKg={weightKg}
        measurements={{
          measuredAt: measurements.measuredAt ?? null,
          neckCm: measurements.neckCm ?? null,
          chestCm: measurements.chestCm ?? null,
          waistCm: measurements.waistCm ?? null,
          hipsCm: measurements.hipsCm ?? null,
          bicepsCm: measurements.bicepsCm ?? null,
          shoulderCm: measurements.shoulderCm ?? null,
          forearmCm: measurements.forearmCm ?? null,
          thighCm: measurements.thighCm ?? null,
          calfCm: measurements.calfCm ?? null,
          heightCm: measurements.heightCm ?? null,
        }}
        onSaved={(patch) => onSaved?.(patch)}
      />
    </div>
  );
}

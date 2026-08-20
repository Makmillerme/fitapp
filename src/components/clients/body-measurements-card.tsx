"use client";

import { useRef, useState } from "react";
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

const PARTS: Array<{ key: BodyKey; label: string; short: string }> = [
  { key: "neckCm", label: "Шия", short: "Шия" },
  { key: "shoulderCm", label: "Плечі", short: "Плечі" },
  { key: "chestCm", label: "Груди", short: "Груди" },
  { key: "bicepsCm", label: "Біцепс", short: "Біцепс" },
  { key: "forearmCm", label: "Передпліччя", short: "Передпл." },
  { key: "waistCm", label: "Талія", short: "Талія" },
  { key: "hipsCm", label: "Таз", short: "Таз" },
  { key: "thighCm", label: "Стегно", short: "Стегно" },
  { key: "calfCm", label: "Ікра", short: "Ікра" },
];

const HEAD_Y = 82;
const FEET_Y = 955;
const RULER_X = 86;

const fmtCm = (value?: number | null) =>
  value == null ? "\u2014" : `${Number.isInteger(value) ? value : value.toFixed(1)} см`;

const fmtKg = (value?: number | null) =>
  value == null ? "\u2014" : `${Number.isInteger(value) ? value : value.toFixed(1)} кг`;

function hitBodyKey(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
  parts: Array<{ key: BodyKey }>,
): BodyKey | null {
  for (const { key } of parts) {
    for (const idx of ZONE_HOLES[key]) {
      const el = svg.querySelector<SVGGeometryElement>(`[data-zone-hit="${key}-${idx}"]`);
      if (!el) continue;
      const ctm = el.getScreenCTM();
      if (!ctm) continue;
      const local = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
      if (el.isPointInFill(local)) return key;
    }
  }
  return null;
}

export function BodyMeasurementsCard({
  clientId,
  measurements,
  weightKg = null,
  onSaved,
}: Props) {
  const [selected, setSelected] = useState<BodyKey | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
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
  const figureTx = -140;

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

      <div className="relative rounded-2xl bg-muted/40 p-2 sm:p-3">
        <div
          className="cursor-pointer touch-pan-y"
          onPointerDown={(e) => {
            pointerStartRef.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={(e) => {
            const start = pointerStartRef.current;
            pointerStartRef.current = null;
            if (!start || !svgRef.current) return;
            const dx = e.clientX - start.x;
            const dy = e.clientY - start.y;
            if (dx * dx + dy * dy > 64) return;
            const key = hitBodyKey(svgRef.current, e.clientX, e.clientY, visibleParts);
            if (key) toggle(key);
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 760 1088"
            className="pointer-events-none h-auto w-full"
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
                    data-zone-hit={`${key}-${idx}`}
                    d={SKELETON_SUBPATHS[idx]}
                    fill="transparent"
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
        </div>

        {visibleParts.length > 0 ? (
          <div
            className="pointer-events-auto absolute top-1/2 right-1 z-10 flex w-14 -translate-y-1/2 flex-col items-stretch justify-center gap-0.5 sm:right-2"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {visibleParts.map(({ key, label, short }) => {
              const active = activeSelected === key;
              return (
                <Button
                  key={key}
                  type="button"
                  variant="ghost"
                  aria-pressed={active}
                  title={label}
                  onClick={() => toggle(key)}
                  className={cn(
                    "h-auto min-h-0 w-full min-w-0 flex-col items-start gap-0 overflow-hidden rounded-lg px-1 py-1 text-left",
                    active && "bg-primary/10",
                  )}
                >
                  <span
                    className={cn(
                      "w-full truncate text-[10px] font-medium leading-tight text-muted-foreground",
                      active && "text-primary",
                    )}
                  >
                    {short}
                  </span>
                  <span
                    className={cn(
                      "w-full truncate text-[11px] font-semibold text-foreground",
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

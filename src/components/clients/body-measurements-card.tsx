"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Measurements = {
  measuredAt?: string | null;
  neckCm?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  hipsCm?: number | null;
  bicepsCm?: number | null;
  thighCm?: number | null;
  calfCm?: number | null;
  heightCm?: number | null;
};

type BodyKey = Exclude<keyof Measurements, "measuredAt" | "heightCm">;

type Props = {
  measurements: Measurements;
  weightKg?: number | null;
};

type Zone = { cx: number; cy: number; rx: number; ry: number };

const ZONES: Record<BodyKey, Zone> = {
  neckCm: { cx: 512, cy: 210, rx: 48, ry: 30 },
  chestCm: { cx: 512, cy: 318, rx: 108, ry: 68 },
  waistCm: { cx: 512, cy: 455, rx: 96, ry: 48 },
  hipsCm: { cx: 512, cy: 548, rx: 110, ry: 50 },
  bicepsCm: { cx: 648, cy: 355, rx: 52, ry: 44 },
  thighCm: { cx: 558, cy: 692, rx: 64, ry: 62 },
  calfCm: { cx: 560, cy: 842, rx: 46, ry: 56 },
};

const PARTS: Array<{ key: BodyKey; label: string }> = [
  { key: "neckCm", label: "Шия" },
  { key: "chestCm", label: "Груди" },
  { key: "waistCm", label: "Талія" },
  { key: "hipsCm", label: "Таз" },
  { key: "bicepsCm", label: "Біцепс" },
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
  measurements,
  weightKg = null,
}: Props) {
  const [selected, setSelected] = useState<BodyKey | null>(null);
  const measuredAt = measurements.measuredAt
    ? new Date(measurements.measuredAt).toLocaleDateString("uk-UA")
    : null;

  const toggle = (key: BodyKey) => {
    setSelected((prev) => (prev === key ? null : key));
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">Антропометрія</p>
        <p className="text-xs text-muted-foreground">
          {measuredAt ? `Оновлено ${measuredAt}` : "Поки без замірів"}
        </p>
      </div>

      <div className="flex items-stretch gap-1 rounded-2xl bg-muted/40 p-2 sm:gap-2 sm:p-3">
        <svg
          viewBox="0 0 760 1088"
          className="min-w-0 flex-1"
          role="img"
          aria-label="Схема замірів тіла"
        >


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
            x={RULER_X - 36}
            y={(HEAD_Y + FEET_Y) / 2 - 22}
            width="72"
            height="44"
            rx="12"
            className="fill-card"
          />
          <text
            x={RULER_X}
            y={(HEAD_Y + FEET_Y) / 2 - 2}
            textAnchor="middle"
            className="fill-primary"
            fontSize="15"
            fontWeight="700"
          >
            {fmtCm(measurements.heightCm).replace(" см", "")}
          </text>
          <text
            x={RULER_X}
            y={(HEAD_Y + FEET_Y) / 2 + 16}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize="11"
            fontWeight="600"
          >
            см
          </text>

          <g transform="translate(-80, 0)">
            <defs>
              {PARTS.map(({ key }) => {
                const z = ZONES[key];
                return (
                  <clipPath id={`anthro-zone-${key}`} key={key}>
                    <ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} />
                  </clipPath>
                );
              })}
            </defs>
            <image
              href="/skeleton.svg"
              x="0"
              y="0"
              width="1024"
              height="1024"
              opacity="0.28"
            />

            {selected ? (
              <g
                transform={`translate(${ZONES[selected].cx} ${ZONES[selected].cy}) scale(1.12) translate(${-ZONES[selected].cx} ${-ZONES[selected].cy})`}
              >
                <image
                  href="/skeleton.svg"
                  x="0"
                  y="0"
                  width="1024"
                  height="1024"
                  clipPath={`url(#anthro-zone-${selected})`}
                  opacity="1"
                />
                <ellipse
                  cx={ZONES[selected].cx}
                  cy={ZONES[selected].cy}
                  rx={ZONES[selected].rx}
                  ry={ZONES[selected].ry}
                  fill="color-mix(in oklch, var(--primary) 28%, transparent)"
                  stroke="var(--primary)"
                  strokeWidth="3"
                />
              </g>
            ) : null}

            {PARTS.map(({ key, label }) => {
              const z = ZONES[key];
              return (
                <ellipse
                  key={key}
                  cx={z.cx}
                  cy={z.cy}
                  rx={z.rx + 8}
                  ry={z.ry + 8}
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => toggle(key)}
                >
                  <title>{label}</title>
                </ellipse>
              );
            })}

            <ellipse
              cx="512"
              cy="1018"
              rx="148"
              ry="18"
              fill="color-mix(in oklch, var(--foreground) 14%, transparent)"
            />
            <ellipse
              cx="512"
              cy="1012"
              rx="138"
              ry="14"
              fill="color-mix(in oklch, var(--card) 92%, var(--foreground))"
              stroke="color-mix(in oklch, var(--border) 80%, transparent)"
              strokeWidth="2"
            />
            <text
              x="512"
              y="1017"
              textAnchor="middle"
              className="fill-foreground"
              fontSize="18"
              fontWeight="700"
            >
              {fmtKg(weightKg)}
            </text>
          </g>
        </svg>

        <div className="flex w-[4.75rem] shrink-0 flex-col justify-between py-1 sm:w-24">
          {PARTS.map(({ key, label }) => {
            const active = selected === key;
            const hasValue = measurements[key] != null;
            return (
              <Button
                key={key}
                type="button"
                variant="ghost"
                aria-pressed={active}
                onClick={() => toggle(key)}
                className={cn(
                  "h-auto min-h-0 flex-col items-start gap-0 rounded-xl px-1.5 py-1 text-left whitespace-normal",
                  active && "bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-[11px]",
                    active && "text-primary",
                  )}
                >
                  {label}
                </span>
                <span
                  className={cn(
                    "font-semibold text-foreground transition-[font-size] duration-200",
                    active ? "text-base text-primary sm:text-lg" : "text-xs sm:text-sm",
                    !hasValue && !active && "text-muted-foreground",
                  )}
                >
                  {fmtCm(measurements[key])}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

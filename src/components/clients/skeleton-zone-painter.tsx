"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SkeletonFigure, SKELETON_VIEWBOX } from "@/components/clients/skeleton-figure";
import { SKELETON_SUBPATHS } from "@/components/clients/skeleton-subpaths";
import {
  ZONE_HOLES,
  type BodyZoneKey,
} from "@/components/clients/skeleton-zone-map";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fitapp:skeleton-zone-paint";

const GROUPS: Array<{ key: BodyZoneKey; label: string; color: string }> = [
  { key: "neckCm", label: "Шия", color: "#eab308" },
  { key: "shoulderCm", label: "Плечі", color: "#0f766e" },
  { key: "chestCm", label: "Груди", color: "#1d4ed8" },
  { key: "bicepsCm", label: "Біцепс", color: "#db2777" },
  { key: "forearmCm", label: "Передпліччя", color: "#b45309" },
  { key: "waistCm", label: "Талія", color: "#16a34a" },
  { key: "hipsCm", label: "Таз", color: "#7c3aed" },
  { key: "thighCm", label: "Стегно", color: "#ea580c" },
  { key: "calfCm", label: "Ікра", color: "#06b6d4" },
];

type ZoneMap = Record<BodyZoneKey, number[]>;
type Tool = BodyZoneKey | "eraser";

const emptyMap = (): ZoneMap => ({
  neckCm: [],
  shoulderCm: [],
  chestCm: [],
  waistCm: [],
  hipsCm: [],
  bicepsCm: [],
  forearmCm: [],
  thighCm: [],
  calfCm: [],
});

const fromCanonical = (): ZoneMap => ({
  neckCm: [...ZONE_HOLES.neckCm],
  shoulderCm: [...ZONE_HOLES.shoulderCm],
  chestCm: [...ZONE_HOLES.chestCm],
  waistCm: [...ZONE_HOLES.waistCm],
  hipsCm: [...ZONE_HOLES.hipsCm],
  bicepsCm: [...ZONE_HOLES.bicepsCm],
  forearmCm: [...ZONE_HOLES.forearmCm],
  thighCm: [...ZONE_HOLES.thighCm],
  calfCm: [...ZONE_HOLES.calfCm],
});

function cloneMap(map: ZoneMap): ZoneMap {
  return {
    neckCm: [...map.neckCm],
    shoulderCm: [...(map.shoulderCm ?? [])],
    chestCm: [...map.chestCm],
    waistCm: [...map.waistCm],
    hipsCm: [...map.hipsCm],
    bicepsCm: [...map.bicepsCm],
    forearmCm: [...(map.forearmCm ?? [])],
    thighCm: [...map.thighCm],
    calfCm: [...map.calfCm],
  };
}

function ownerOf(map: ZoneMap, idx: number): BodyZoneKey | null {
  for (const { key } of GROUPS) {
    if (map[key].includes(idx)) return key;
  }
  return null;
}

function pathAnchor(d: string): { x: number; y: number } {
  const nums = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    sx += nums[i];
    sy += nums[i + 1];
    n += 1;
  }
  return n ? { x: sx / n, y: sy / n } : { x: 0, y: 0 };
}

const HOLES = SKELETON_SUBPATHS.slice(1).map((d, i) => ({
  idx: i + 1,
  d,
  ...pathAnchor(d),
}));

function toExportJson(map: ZoneMap): string {
  return `${JSON.stringify(map, null, 2)}\n`;
}

export function SkeletonZonePainter() {
  const [map, setMap] = useState<ZoneMap>(emptyMap);
  const [tool, setTool] = useState<Tool>("neckCm");
  const [showIndex, setShowIndex] = useState(false);
  const [copied, setCopied] = useState(false);
  const painting = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as ZoneMap;
        setMap({
          ...emptyMap(),
          ...parsed,
        });
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [map, ready]);

  const apply = useCallback((idx: number, mode: "toggle" | "paint") => {
    setMap((prev) => {
      const next = cloneMap(prev);
      const current = ownerOf(next, idx);
      for (const { key } of GROUPS) {
        next[key] = next[key].filter((i) => i !== idx);
      }
      if (tool === "eraser") return next;
      if (mode === "toggle" && current === tool) return next;
      next[tool] = [...next[tool], idx].sort((a, b) => a - b);
      return next;
    });
  }, [tool]);

  const json = useMemo(() => toExportJson(map), [map]);
  const total = GROUPS.reduce((sum, g) => sum + map[g.key].length, 0);

  const copyJson = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const downloadJson = () => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skeleton-zones.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col bg-card text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <h1 className="text-sm font-bold">Малювальник зон скелета</h1>
          <p className="text-xs text-muted-foreground">
            Оберіть групу справа і зафарбуйте полігони. Потім скопіюйте JSON і
            надішліть у чат.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">зафарбовано {total}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-muted/40 p-3">
          <svg
            viewBox={SKELETON_VIEWBOX}
            className="h-full max-h-[90dvh] w-full max-w-[520px] touch-none select-none"
            onPointerUp={() => {
              painting.current = false;
            }}
            onPointerLeave={() => {
              painting.current = false;
            }}
          >
            {HOLES.map(({ idx, d }) => {
              const owner = ownerOf(map, idx);
              const fill = owner
                ? (GROUPS.find((g) => g.key === owner)?.color ?? "#fff")
                : "#ffffff";
              return (
                <path
                  key={idx}
                  d={d}
                  fill={fill}
                  stroke="#7f1d1d"
                  strokeWidth="1.1"
                  className="cursor-pointer"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    painting.current = true;
                    apply(idx, "toggle");
                  }}
                  onPointerEnter={() => {
                    if (painting.current) apply(idx, "paint");
                  }}
                >
                  <title>{`#${idx}${owner ? ` · ${GROUPS.find((g) => g.key === owner)?.label}` : ""}`}</title>
                </path>
              );
            })}
            <SkeletonFigure
              fill="currentColor"
              className="pointer-events-none text-primary"
              opacity={0.22}
            />
            {showIndex
              ? HOLES.map(({ idx, x, y }) => (
                  <text
                    key={`n-${idx}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none fill-foreground"
                    fontSize="11"
                    fontWeight="700"
                  >
                    {idx}
                  </text>
                ))
              : null}
          </svg>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-3 border-t border-border p-4 md:w-72 md:border-t-0 md:border-l">
          <div className="flex flex-col gap-1.5">
            {GROUPS.map((g) => {
              const active = tool === g.key;
              return (
                <Button
                  key={g.key}
                  type="button"
                  variant={active ? "secondary" : "ghost"}
                  aria-pressed={active}
                  onClick={() => setTool(g.key)}
                  className={cn(
                    "h-auto justify-start gap-2 px-2 py-1.5",
                    active && "ring-1 ring-border",
                  )}
                >
                  <span
                    className="size-3.5 rounded-sm"
                    style={{ backgroundColor: g.color }}
                    aria-hidden
                  />
                  <span className="flex-1 text-left text-sm">{g.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {map[g.key].length}
                  </span>
                </Button>
              );
            })}
            <Button
              type="button"
              variant={tool === "eraser" ? "secondary" : "ghost"}
              aria-pressed={tool === "eraser"}
              onClick={() => setTool("eraser")}
              className="h-auto justify-start px-2 py-1.5"
            >
              Гумка
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant={showIndex ? "secondary" : "outline"}
              onClick={() => setShowIndex((v) => !v)}
            >
              {showIndex ? "Сховати номери" : "Показати номери"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setMap(emptyMap())}>
              Очистити все
            </Button>
            <Button type="button" variant="outline" onClick={() => setMap(fromCanonical())}>
              Підставити поточний мапінг
            </Button>
            <Button type="button" onClick={() => void copyJson()}>
              {copied ? "Скопійовано" : "Копіювати JSON"}
            </Button>
            <Button type="button" variant="outline" onClick={downloadJson}>
              Завантажити JSON
            </Button>
          </div>

          <pre className="max-h-48 overflow-auto rounded-xl bg-muted p-2 text-[10px] leading-snug text-muted-foreground">
            {json}
          </pre>
        </aside>
      </div>
    </main>
  );
}

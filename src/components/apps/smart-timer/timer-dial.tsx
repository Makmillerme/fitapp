"use client";

import { cn } from "@/lib/utils";
import {
  elapsedToDialAngles,
  formatClock,
  formatStopwatchParts,
} from "@/lib/timer/format";

/** Round to 3 decimals — identical SSR/client SVG attrs. */
function r3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function polar(cx: number, cy: number, angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: r3(cx + radius * Math.cos(rad)),
    y: r3(cy + radius * Math.sin(rad)),
  };
}

type Tick = {
  i: number;
  major: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type Label = { n: number; x: number; y: number };

type SubTick = { i: number; x1: number; y1: number; x2: number; y2: number };

const DIAL_TICKS: Tick[] = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const outer = polar(100, 100, i * 6, 93);
  const inner = polar(100, 100, i * 6, major ? 80 : 86);
  return {
    i,
    major,
    x1: inner.x,
    y1: inner.y,
    x2: outer.x,
    y2: outer.y,
  };
});

const DIAL_LABELS: Label[] = [60, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
  (n) => {
    const angle = n === 60 ? 0 : n * 6;
    const p = polar(100, 100, angle, 70);
    return { n, x: p.x, y: p.y };
  },
);

/** Larger minutes sub-dial geometry (radius ~22 in viewBox units). */
const SUB_TICKS: SubTick[] = Array.from({ length: 30 }, (_, i) => {
  const major = i % 5 === 0;
  const angle = i * 12;
  const outer = polar(0, 0, angle, major ? 20 : 19);
  const inner = polar(0, 0, angle, major ? 15 : 16.5);
  return {
    i,
    x1: inner.x,
    y1: inner.y,
    x2: outer.x,
    y2: outer.y,
  };
});

const SUB_LABELS: Label[] = [30, 5, 10, 15, 20, 25].map((n) => {
  const angle = n === 30 ? 0 : n * 12;
  const p = polar(0, 0, angle, 11);
  return { n, x: p.x, y: p.y };
});

export type ReadoutPlacement = "below" | "overlay" | "none";

type Props = {
  elapsedMs: number;
  displaySeconds: number;
  displayMs?: number;
  caption?: string;
  accentClassName?: string;
  className?: string;
  size?: number;
  /** Where to put digital time. Default: below — avoids overlapping scale. */
  readoutPlacement?: ReadoutPlacement;
  /** Extra content in dial upper area (e.g. prep countdown). */
  overlayContent?: React.ReactNode;
};

function DigitalReadout({
  displaySeconds,
  displayMs,
  caption,
  accentClassName,
  size = "md",
}: {
  displaySeconds: number;
  displayMs?: number;
  caption?: string;
  accentClassName: string;
  size?: "sm" | "md" | "lg";
}) {
  const parts =
    displayMs != null
      ? formatStopwatchParts(displayMs)
      : (() => {
          const clock = formatClock(displaySeconds);
          const [mm, ss] = clock.split(":");
          return { mm, ss, cs: null as string | null };
        })();

  const textClass =
    size === "lg"
      ? "text-[2.1rem]"
      : size === "sm"
        ? "text-[1.5rem]"
        : "text-[1.85rem]";

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "font-mono font-bold leading-none tracking-tighter",
          textClass,
        )}
      >
        <span className="text-foreground">{parts.mm}</span>
        <span className={cn("mx-0.5", accentClassName)}>:</span>
        <span className={accentClassName}>{parts.ss}</span>
        {parts.cs != null ? (
          <>
            <span className={accentClassName}>,</span>
            <span className={cn("text-[0.55em] align-baseline", accentClassName)}>
              {parts.cs}
            </span>
          </>
        ) : null}
      </div>
      {caption ? (
        <p className="mt-1.5 text-center text-[11px] font-medium text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

export function TimerDial({
  elapsedMs,
  displaySeconds,
  displayMs,
  caption,
  accentClassName = "text-primary",
  className,
  size = 280,
  readoutPlacement = "below",
  overlayContent,
}: Props) {
  const { secondsAngleDeg, minutesAngleDeg } = elapsedToDialAngles(elapsedMs);
  const needleTip = polar(100, 100, secondsAngleDeg, 78);
  const subTip = polar(0, 0, minutesAngleDeg, 14);

  const showOverlayReadout = readoutPlacement === "overlay" && !overlayContent;
  const showBelowReadout = readoutPlacement === "below";

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <div className="absolute inset-0 overflow-hidden rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]" />

        <svg
          viewBox="0 0 200 200"
          className="relative z-10 size-full overflow-hidden"
          aria-hidden
        >
          {/* Layer 0: face */}
          <circle
            cx="100"
            cy="100"
            r="97"
            fill="white"
            className="stroke-black/5"
            strokeWidth="0.5"
          />

          {/* Layer 1: main scale ticks + numerals */}
          <g data-layer="scale">
            {DIAL_TICKS.map(({ i, major, x1, y1, x2, y2 }) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={major ? "#1a1a1a" : "#d0d0d0"}
                strokeWidth={major ? 1.4 : 0.6}
                strokeLinecap="round"
              />
            ))}
            {DIAL_LABELS.map(({ n, x, y }) => (
              <text
                key={n}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#3a3a3a"
                style={{ fontSize: 8.5, fontWeight: 600 }}
              >
                {n}
              </text>
            ))}
          </g>

          {/* Layer 2: minutes sub-dial — above scale, below seconds needle */}
          {/* Higher than label 30 (y≈170) so 30 stays visible below the sub-dial */}
          <g data-layer="sub-dial" transform="translate(100 136)">
            <circle r="22" fill="white" stroke="#e8e8e8" strokeWidth="0.9" />
            {SUB_TICKS.map(({ i, x1, y1, x2, y2 }) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 5 === 0 ? "#555" : "#d0d0d0"}
                strokeWidth={i % 5 === 0 ? 1 : 0.55}
                strokeLinecap="round"
              />
            ))}
            {SUB_LABELS.map(({ n, x, y }) => (
              <text
                key={n}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#666"
                style={{ fontSize: 4.5, fontWeight: 600 }}
              >
                {n}
              </text>
            ))}
            <line
              x1={0}
              y1={0}
              x2={subTip.x}
              y2={subTip.y}
              stroke="#1a1a1a"
              strokeWidth={1.15}
              strokeLinecap="round"
            />
            <circle r="1.8" fill="#1a1a1a" />
          </g>

          {/* Layer 3: seconds needle — always on top of sub-dial */}
          <g data-layer="needle">
            <line
              x1={100}
              y1={100}
              x2={needleTip.x}
              y2={needleTip.y}
              className="stroke-primary"
              strokeWidth={1.35}
              strokeLinecap="round"
            />
            <circle cx={100} cy={100} r={4} className="fill-primary" />
            <circle cx={100} cy={100} r={1.5} fill="white" />
          </g>
        </svg>

      </div>

      {/* Readout / overlay always outside the face — never covers scale or sits above needle incorrectly */}
      {overlayContent ? (
        <div className="flex flex-col items-center">{overlayContent}</div>
      ) : null}

      {showOverlayReadout || showBelowReadout ? (
        <DigitalReadout
          displaySeconds={displaySeconds}
          displayMs={displayMs}
          caption={caption}
          accentClassName={accentClassName}
          size={showBelowReadout ? "lg" : "sm"}
        />
      ) : null}
    </div>
  );
}

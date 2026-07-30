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

type Props = {
  measurements: Measurements;
};

type MeasureKey = Exclude<keyof Measurements, "measuredAt">;

const ZONE_POINTS: Record<MeasureKey, { x: number; y: number; rx: number; ry: number }> = {
  neckCm: { x: 512, y: 210, rx: 44, ry: 26 },
  chestCm: { x: 512, y: 310, rx: 100, ry: 60 },
  waistCm: { x: 512, y: 455, rx: 92, ry: 52 },
  hipsCm: { x: 512, y: 545, rx: 106, ry: 52 },
  bicepsCm: { x: 650, y: 360, rx: 48, ry: 40 },
  thighCm: { x: 555, y: 690, rx: 60, ry: 58 },
  calfCm: { x: 560, y: 840, rx: 42, ry: 54 },
  heightCm: { x: 870, y: 510, rx: 0, ry: 0 },
};

const LABELS: Array<{
  key: MeasureKey;
  label: string;
  anchor: { x: number; y: number };
  target: { x: number; y: number };
}> = [
  { key: "neckCm", label: "Шия", anchor: { x: 110, y: 170 }, target: { x: 475, y: 210 } },
  { key: "chestCm", label: "Груди", anchor: { x: 86, y: 280 }, target: { x: 420, y: 300 } },
  { key: "waistCm", label: "Талія", anchor: { x: 86, y: 430 }, target: { x: 422, y: 450 } },
  { key: "hipsCm", label: "Таз", anchor: { x: 98, y: 540 }, target: { x: 408, y: 545 } },
  { key: "bicepsCm", label: "Біцепс", anchor: { x: 760, y: 240 }, target: { x: 625, y: 340 } },
  { key: "thighCm", label: "Стегно", anchor: { x: 770, y: 620 }, target: { x: 575, y: 680 } },
  { key: "calfCm", label: "Ікра", anchor: { x: 780, y: 785 }, target: { x: 575, y: 830 } },
  { key: "heightCm", label: "Зріст", anchor: { x: 865, y: 100 }, target: { x: 865, y: 920 } },
];

const fmtCm = (value?: number | null) => (value == null ? "—" : `${value.toFixed(1)} см`);

export function BodyMeasurementsCard({ measurements }: Props) {
  const measuredAt = measurements.measuredAt
    ? new Date(measurements.measuredAt).toLocaleDateString("uk-UA")
    : null;

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">Антропометрія</p>
        <p className="text-xs text-muted-foreground">
          {measuredAt ? `Оновлено ${measuredAt}` : "Поки без замірів"}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl bg-muted/45 p-3">
        <svg viewBox="0 0 1024 1024" className="h-auto w-full" role="img" aria-label="Схема замірів тіла">
          <defs>
            <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
            </marker>
          </defs>

          <image href="/skeleton.svg" x="0" y="0" width="1024" height="1024" opacity="0.32" />

          {(Object.keys(ZONE_POINTS) as MeasureKey[])
            .filter((key) => key !== "heightCm")
            .map((key) => {
              const zone = ZONE_POINTS[key];
              const active = measurements[key] != null;
              return (
                <ellipse
                  key={key}
                  cx={zone.x}
                  cy={zone.y}
                  rx={zone.rx}
                  ry={zone.ry}
                  fill={active ? "rgba(235, 0, 41, 0.22)" : "rgba(148, 163, 184, 0.13)"}
                  stroke={active ? "rgba(235, 0, 41, 0.55)" : "rgba(148, 163, 184, 0.2)"}
                  strokeWidth={2}
                />
              );
            })}

          <line
            x1="900"
            y1="130"
            x2="900"
            y2="915"
            stroke="rgba(235, 0, 41, 0.9)"
            strokeWidth="3"
            markerStart="url(#arrowHead)"
            markerEnd="url(#arrowHead)"
          />

          {LABELS.map((item) => {
            const active = measurements[item.key] != null;
            return (
              <g key={item.key}>
                <line
                  x1={item.anchor.x}
                  y1={item.anchor.y}
                  x2={item.target.x}
                  y2={item.target.y}
                  stroke={active ? "rgba(235, 0, 41, 0.8)" : "rgba(100, 116, 139, 0.55)"}
                  strokeWidth={2}
                />
                <text
                  x={item.anchor.x}
                  y={item.anchor.y - 10}
                  fontSize="24"
                  fontWeight="700"
                  fill={active ? "rgba(235,0,41,0.95)" : "rgba(51,65,85,0.85)"}
                >
                  {item.label}
                </text>
                <text
                  x={item.anchor.x}
                  y={item.anchor.y + 18}
                  fontSize="22"
                  fill={active ? "rgba(15,23,42,0.95)" : "rgba(71,85,105,0.85)"}
                >
                  {fmtCm(measurements[item.key])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

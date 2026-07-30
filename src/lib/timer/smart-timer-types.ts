export type SmartTimerMode = "amrap" | "tabata" | "emom" | "for-time";

export type AmrapConfig = {
  durationSeconds: number;
};

export type TabataConfig = {
  rounds: number;
  workSeconds: number;
  restSeconds: number;
};

export type ForTimeConfig = {
  capEnabled: boolean;
  capSeconds: number;
};

export type EmomConfig = {
  intervalSeconds: number;
  durationSeconds: number;
};

export const DEFAULT_AMRAP_CONFIG: AmrapConfig = {
  durationSeconds: 10 * 60,
};

export const DEFAULT_TABATA_CONFIG: TabataConfig = {
  rounds: 8,
  workSeconds: 20,
  restSeconds: 10,
};

export const DEFAULT_FOR_TIME_CONFIG: ForTimeConfig = {
  capEnabled: false,
  capSeconds: 10 * 60,
};

export const DEFAULT_EMOM_CONFIG: EmomConfig = {
  intervalSeconds: 60,
  durationSeconds: 10 * 60,
};

/** Countdown before SmartTimer workout starts. */
export const PREP_SECONDS = 10;

export const AMRAP_MINUTE_PRESETS = [5, 8, 10, 12, 15, 20, 30] as const;

export const DURATION_PRESETS_SECONDS = [
  10, 15, 20, 30, 45, 60, 75, 90, 120, 180, 240, 300,
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function normalizeAmrapConfig(config: Partial<AmrapConfig>): AmrapConfig {
  return {
    durationSeconds: clamp(config.durationSeconds ?? DEFAULT_AMRAP_CONFIG.durationSeconds, 60, 3600),
  };
}

export function normalizeTabataConfig(config: Partial<TabataConfig>): TabataConfig {
  return {
    rounds: clamp(config.rounds ?? DEFAULT_TABATA_CONFIG.rounds, 1, 99),
    workSeconds: clamp(config.workSeconds ?? DEFAULT_TABATA_CONFIG.workSeconds, 5, 600),
    restSeconds: clamp(config.restSeconds ?? DEFAULT_TABATA_CONFIG.restSeconds, 5, 300),
  };
}

export function normalizeForTimeConfig(config: Partial<ForTimeConfig>): ForTimeConfig {
  return {
    capEnabled: Boolean(config.capEnabled ?? DEFAULT_FOR_TIME_CONFIG.capEnabled),
    capSeconds: clamp(config.capSeconds ?? DEFAULT_FOR_TIME_CONFIG.capSeconds, 60, 7200),
  };
}

export function normalizeEmomConfig(config: Partial<EmomConfig>): EmomConfig {
  return {
    intervalSeconds: clamp(config.intervalSeconds ?? DEFAULT_EMOM_CONFIG.intervalSeconds, 10, 600),
    durationSeconds: clamp(config.durationSeconds ?? DEFAULT_EMOM_CONFIG.durationSeconds, 60, 7200),
  };
}

export function tabataTotalSeconds(config: TabataConfig): number {
  const { rounds, workSeconds, restSeconds } = config;
  if (rounds <= 0) return 0;
  return rounds * workSeconds + Math.max(0, rounds - 1) * restSeconds;
}

const AMRAP_KEY = "fitapp:smart-timer:amrap";
const TABATA_KEY = "fitapp:smart-timer:tabata";
const FOR_TIME_KEY = "fitapp:smart-timer:for-time";
const EMOM_KEY = "fitapp:smart-timer:emom";

export function loadAmrapConfig(): AmrapConfig {
  if (typeof window === "undefined") return DEFAULT_AMRAP_CONFIG;
  try {
    const raw = window.localStorage.getItem(AMRAP_KEY);
    if (!raw) return DEFAULT_AMRAP_CONFIG;
    return normalizeAmrapConfig(JSON.parse(raw) as Partial<AmrapConfig>);
  } catch {
    return DEFAULT_AMRAP_CONFIG;
  }
}

export function saveAmrapConfig(config: AmrapConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AMRAP_KEY, JSON.stringify(normalizeAmrapConfig(config)));
}

export function loadTabataConfig(): TabataConfig {
  if (typeof window === "undefined") return DEFAULT_TABATA_CONFIG;
  try {
    const raw = window.localStorage.getItem(TABATA_KEY);
    if (!raw) return DEFAULT_TABATA_CONFIG;
    return normalizeTabataConfig(JSON.parse(raw) as Partial<TabataConfig>);
  } catch {
    return DEFAULT_TABATA_CONFIG;
  }
}

export function saveTabataConfig(config: TabataConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TABATA_KEY, JSON.stringify(normalizeTabataConfig(config)));
}

export function loadForTimeConfig(): ForTimeConfig {
  if (typeof window === "undefined") return DEFAULT_FOR_TIME_CONFIG;
  try {
    const raw = window.localStorage.getItem(FOR_TIME_KEY);
    if (!raw) return DEFAULT_FOR_TIME_CONFIG;
    return normalizeForTimeConfig(JSON.parse(raw) as Partial<ForTimeConfig>);
  } catch {
    return DEFAULT_FOR_TIME_CONFIG;
  }
}

export function saveForTimeConfig(config: ForTimeConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOR_TIME_KEY, JSON.stringify(normalizeForTimeConfig(config)));
}

export function loadEmomConfig(): EmomConfig {
  if (typeof window === "undefined") return DEFAULT_EMOM_CONFIG;
  try {
    const raw = window.localStorage.getItem(EMOM_KEY);
    if (!raw) return DEFAULT_EMOM_CONFIG;
    return normalizeEmomConfig(JSON.parse(raw) as Partial<EmomConfig>);
  } catch {
    return DEFAULT_EMOM_CONFIG;
  }
}

export function saveEmomConfig(config: EmomConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EMOM_KEY, JSON.stringify(normalizeEmomConfig(config)));
}

export function splitSeconds(total: number) {
  const safe = Math.max(0, Math.floor(total));
  return {
    minutes: Math.floor(safe / 60),
    seconds: safe % 60,
  };
}

export function toSeconds(minutes: number, seconds: number) {
  return Math.max(0, minutes) * 60 + Math.max(0, seconds);
}

export function formatClock(totalSeconds: number) {
  const { minutes, seconds } = splitSeconds(totalSeconds);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatMinutesLabel(totalSeconds: number) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  if (minutes === 1) return "1 хвилина";
  if (minutes >= 2 && minutes <= 4) return `${minutes} хвилини`;
  return `${minutes} хвилин`;
}

export function formatDurationLabel(totalSeconds: number) {
  const { minutes, seconds } = splitSeconds(totalSeconds);
  if (minutes === 0) return `${seconds} сек`;
  if (seconds === 0) return formatMinutesLabel(minutes * 60);
  return `${formatClock(totalSeconds)}`;
}

/** Stopwatch dial: full circle = 60s; sub-dial ≈ 30 minutes. */
export function elapsedToDialAngles(elapsedMs: number) {
  const elapsedSec = Math.max(0, elapsedMs) / 1000;
  return {
    secondsAngleDeg: ((elapsedSec % 60) / 60) * 360,
    minutesAngleDeg: ((Math.floor(elapsedSec / 60) % 30) / 30) * 360,
  };
}

/** OnePlus-style readout parts: MM black, SS,CS primary. */
export function formatStopwatchParts(ms: number) {
  const safe = Math.max(0, ms);
  const totalCs = Math.floor(safe / 10);
  const cs = totalCs % 100;
  const totalSec = Math.floor(totalCs / 100);
  const seconds = totalSec % 60;
  const minutes = Math.floor(totalSec / 60);
  return {
    mm: String(minutes).padStart(2, "0"),
    ss: String(seconds).padStart(2, "0"),
    cs: String(cs).padStart(2, "0"),
  };
}

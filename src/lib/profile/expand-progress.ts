export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

export function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

/** Animate a numeric progress value to a target with rAF. Returns a cancel fn. */
export function animateProgressTo(
  from: number,
  to: number,
  durationMs: number,
  onUpdate: (value: number) => void,
  onComplete?: () => void,
) {
  const start = performance.now();
  let frame = 0;

  const tick = (now: number) => {
    const t = clamp((now - start) / durationMs, 0, 1);
    onUpdate(lerp(from, to, easeOutCubic(t)));
    if (t < 1) {
      frame = requestAnimationFrame(tick);
    } else {
      onComplete?.();
    }
  };

  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

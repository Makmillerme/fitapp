"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_AMRAP_CONFIG,
  loadAmrapConfig,
  normalizeAmrapConfig,
  PREP_SECONDS,
  saveAmrapConfig,
  type AmrapConfig,
} from "@/lib/timer/smart-timer-types";

export type AmrapPhase = "idle" | "prep" | "running" | "paused" | "done";

export function useAmrapTimer() {
  const [config, setConfigState] = useState<AmrapConfig>(DEFAULT_AMRAP_CONFIG);
  const [phase, setPhase] = useState<AmrapPhase>("idle");
  const [remainingMs, setRemainingMs] = useState(0);
  const [segmentMs, setSegmentMs] = useState(0);
  const [rounds, setRounds] = useState(0);
  const endAtRef = useRef<number | null>(null);
  const remainingOnPauseRef = useRef(0);
  const pausedFromPrepRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<AmrapPhase>("idle");
  const configRef = useRef(config);

  useEffect(() => {
    setConfigState(loadAmrapConfig());
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setConfig = useCallback((next: AmrapConfig) => {
    const normalized = normalizeAmrapConfig(next);
    setConfigState(normalized);
    saveAmrapConfig(normalized);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const beginWorkout = useCallback(() => {
    const total = configRef.current.durationSeconds * 1000;
    setSegmentMs(total);
    setRemainingMs(total);
    remainingOnPauseRef.current = total;
    pausedFromPrepRef.current = false;
    endAtRef.current = performance.now() + total;
    setPhase("running");
    phaseRef.current = "running";
  }, []);

  const tick = useCallback(() => {
    const endAt = endAtRef.current;
    if (endAt == null) return;
    const left = Math.max(0, endAt - performance.now());
    setRemainingMs(left);
    if (left <= 0) {
      if (phaseRef.current === "prep") {
        beginWorkout();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      stopRaf();
      endAtRef.current = null;
      setPhase("done");
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [beginWorkout, stopRaf]);

  const start = useCallback(() => {
    stopRaf();
    setRounds(0);
    const prepMs = PREP_SECONDS * 1000;
    setSegmentMs(prepMs);
    setRemainingMs(prepMs);
    remainingOnPauseRef.current = prepMs;
    pausedFromPrepRef.current = false;
    endAtRef.current = performance.now() + prepMs;
    setPhase("prep");
    phaseRef.current = "prep";
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, tick]);

  const skipPrep = useCallback(() => {
    if (phaseRef.current !== "prep") return;
    stopRaf();
    beginWorkout();
    rafRef.current = requestAnimationFrame(tick);
  }, [beginWorkout, stopRaf, tick]);

  const pause = useCallback(() => {
    if (phase !== "running" && phase !== "prep") return;
    pausedFromPrepRef.current = phase === "prep";
    stopRaf();
    const left = endAtRef.current
      ? Math.max(0, endAtRef.current - performance.now())
      : remainingMs;
    remainingOnPauseRef.current = left;
    setRemainingMs(left);
    endAtRef.current = null;
    setPhase("paused");
    phaseRef.current = "paused";
  }, [phase, remainingMs, stopRaf]);

  const resume = useCallback(() => {
    if (phase !== "paused") return;
    const left = remainingOnPauseRef.current;
    if (left <= 0) {
      if (pausedFromPrepRef.current) {
        beginWorkout();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      setPhase("done");
      return;
    }
    endAtRef.current = performance.now() + left;
    if (pausedFromPrepRef.current) {
      setPhase("prep");
      phaseRef.current = "prep";
    } else {
      setPhase("running");
      phaseRef.current = "running";
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [beginWorkout, phase, tick]);

  const reset = useCallback(() => {
    stopRaf();
    endAtRef.current = null;
    remainingOnPauseRef.current = 0;
    pausedFromPrepRef.current = false;
    setRemainingMs(0);
    setSegmentMs(0);
    setRounds(0);
    setPhase("idle");
    phaseRef.current = "idle";
  }, [stopRaf]);

  const incrementRounds = useCallback(() => {
    setRounds((r) => r + 1);
  }, []);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const totalMs = config.durationSeconds * 1000;
  const elapsedMs =
    phase === "idle" || phase === "done"
      ? 0
      : Math.max(0, segmentMs - remainingMs);

  return {
    config,
    setConfig,
    phase,
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    remainingMs,
    elapsedMs,
    totalMs,
    rounds,
    isInPrep: phase === "prep" || (phase === "paused" && pausedFromPrepRef.current),
    start,
    skipPrep,
    pause,
    resume,
    reset,
    incrementRounds,
  };
}

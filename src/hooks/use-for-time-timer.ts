"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_FOR_TIME_CONFIG,
  loadForTimeConfig,
  normalizeForTimeConfig,
  PREP_SECONDS,
  saveForTimeConfig,
  type ForTimeConfig,
} from "@/lib/timer/smart-timer-types";

export type ForTimePhase = "idle" | "prep" | "running" | "paused" | "done";

export type ForTimeLap = {
  id: number;
  lapMs: number;
  totalMs: number;
};

export function useForTimeTimer() {
  const [config, setConfigState] = useState<ForTimeConfig>(DEFAULT_FOR_TIME_CONFIG);
  const [phase, setPhase] = useState<ForTimePhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [prepRemainingMs, setPrepRemainingMs] = useState(0);
  const [laps, setLaps] = useState<ForTimeLap[]>([]);

  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<ForTimePhase>("idle");
  const startAtRef = useRef<number | null>(null);
  const elapsedOnPauseRef = useRef(0);
  const prepEndAtRef = useRef<number | null>(null);
  const prepOnPauseRef = useRef(0);
  const pausedFromPrepRef = useRef(false);
  const configRef = useRef(config);
  const lastLapTotalRef = useRef(0);

  useEffect(() => {
    setConfigState(loadForTimeConfig());
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setConfig = useCallback((next: ForTimeConfig) => {
    const normalized = normalizeForTimeConfig(next);
    setConfigState(normalized);
    saveForTimeConfig(normalized);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const beginRun = useCallback(() => {
    prepEndAtRef.current = null;
    prepOnPauseRef.current = 0;
    setPrepRemainingMs(0);
    startAtRef.current = performance.now();
    setPhase("running");
    phaseRef.current = "running";
  }, []);

  const tick = useCallback(() => {
    if (phaseRef.current === "prep") {
      const endAt = prepEndAtRef.current;
      if (endAt == null) return;
      const left = Math.max(0, endAt - performance.now());
      setPrepRemainingMs(left);
      if (left <= 0) {
        beginRun();
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (phaseRef.current !== "running") return;
    const startedAt = startAtRef.current;
    if (startedAt == null) return;

    const elapsed = elapsedOnPauseRef.current + (performance.now() - startedAt);
    setElapsedMs(elapsed);

    if (configRef.current.capEnabled && elapsed >= configRef.current.capSeconds * 1000) {
      setElapsedMs(configRef.current.capSeconds * 1000);
      stopRaf();
      setPhase("done");
      phaseRef.current = "done";
      startAtRef.current = null;
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [beginRun, stopRaf]);

  const start = useCallback(() => {
    stopRaf();
    setElapsedMs(0);
    setLaps([]);
    elapsedOnPauseRef.current = 0;
    lastLapTotalRef.current = 0;
    const prepMs = PREP_SECONDS * 1000;
    prepOnPauseRef.current = 0;
    prepEndAtRef.current = performance.now() + prepMs;
    setPrepRemainingMs(prepMs);
    setPhase("prep");
    phaseRef.current = "prep";
    pausedFromPrepRef.current = false;
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, tick]);

  const skipPrep = useCallback(() => {
    if (phaseRef.current !== "prep") return;
    stopRaf();
    beginRun();
    rafRef.current = requestAnimationFrame(tick);
  }, [beginRun, stopRaf, tick]);

  const pause = useCallback(() => {
    if (phase !== "running" && phase !== "prep") return;
    stopRaf();
    pausedFromPrepRef.current = phase === "prep";

    if (phase === "prep") {
      const left = prepEndAtRef.current
        ? Math.max(0, prepEndAtRef.current - performance.now())
        : prepRemainingMs;
      prepOnPauseRef.current = left;
      setPrepRemainingMs(left);
      prepEndAtRef.current = null;
    } else {
      const current = startAtRef.current
        ? elapsedOnPauseRef.current + (performance.now() - startAtRef.current)
        : elapsedMs;
      elapsedOnPauseRef.current = current;
      setElapsedMs(current);
      startAtRef.current = null;
    }

    setPhase("paused");
    phaseRef.current = "paused";
  }, [elapsedMs, phase, prepRemainingMs, stopRaf]);

  const resume = useCallback(() => {
    if (phase !== "paused") return;

    if (pausedFromPrepRef.current) {
      const left = prepOnPauseRef.current;
      if (left <= 0) {
        beginRun();
      } else {
        prepEndAtRef.current = performance.now() + left;
        setPrepRemainingMs(left);
        setPhase("prep");
        phaseRef.current = "prep";
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    startAtRef.current = performance.now();
    setPhase("running");
    phaseRef.current = "running";
    rafRef.current = requestAnimationFrame(tick);
  }, [beginRun, phase, tick]);

  const reset = useCallback(() => {
    stopRaf();
    setElapsedMs(0);
    setPrepRemainingMs(0);
    setLaps([]);
    setPhase("idle");
    phaseRef.current = "idle";
    startAtRef.current = null;
    prepEndAtRef.current = null;
    elapsedOnPauseRef.current = 0;
    prepOnPauseRef.current = 0;
    pausedFromPrepRef.current = false;
    lastLapTotalRef.current = 0;
  }, [stopRaf]);

  const addLap = useCallback(() => {
    if (phase !== "running" && phase !== "paused") return;
    const currentTotal = phase === "running" && startAtRef.current
      ? elapsedOnPauseRef.current + (performance.now() - startAtRef.current)
      : elapsedMs;
    const lapMs = Math.max(0, currentTotal - lastLapTotalRef.current);
    lastLapTotalRef.current = currentTotal;

    setLaps((prev) => [
      {
        id: prev.length + 1,
        lapMs,
        totalMs: currentTotal,
      },
      ...prev,
    ]);
  }, [elapsedMs, phase]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const capMs = config.capSeconds * 1000;
  const capRemainingMs = Math.max(0, capMs - elapsedMs);

  return {
    config,
    setConfig,
    phase,
    elapsedMs,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    prepRemainingSeconds: Math.max(0, Math.ceil(prepRemainingMs / 1000)),
    capRemainingSeconds: Math.max(0, Math.ceil(capRemainingMs / 1000)),
    isInPrep: phase === "prep" || (phase === "paused" && pausedFromPrepRef.current),
    laps,
    start,
    skipPrep,
    pause,
    resume,
    reset,
    addLap,
  };
}

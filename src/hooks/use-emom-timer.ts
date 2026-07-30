"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_EMOM_CONFIG,
  loadEmomConfig,
  normalizeEmomConfig,
  PREP_SECONDS,
  saveEmomConfig,
  type EmomConfig,
} from "@/lib/timer/smart-timer-types";

export type EmomPhase = "idle" | "prep" | "running" | "paused" | "done";

export function useEmomTimer() {
  const [config, setConfigState] = useState<EmomConfig>(DEFAULT_EMOM_CONFIG);
  const [phase, setPhase] = useState<EmomPhase>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [prepRemainingMs, setPrepRemainingMs] = useState(0);

  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<EmomPhase>("idle");
  const startAtRef = useRef<number | null>(null);
  const elapsedOnPauseRef = useRef(0);
  const prepEndAtRef = useRef<number | null>(null);
  const prepOnPauseRef = useRef(0);
  const pausedFromPrepRef = useRef(false);
  const configRef = useRef(config);

  useEffect(() => {
    setConfigState(loadEmomConfig());
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setConfig = useCallback((next: EmomConfig) => {
    const normalized = normalizeEmomConfig(next);
    setConfigState(normalized);
    saveEmomConfig(normalized);
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
    const totalMs = configRef.current.durationSeconds * 1000;

    if (elapsed >= totalMs) {
      setElapsedMs(totalMs);
      stopRaf();
      setPhase("done");
      phaseRef.current = "done";
      startAtRef.current = null;
      return;
    }

    setElapsedMs(elapsed);
    rafRef.current = requestAnimationFrame(tick);
  }, [beginRun, stopRaf]);

  const start = useCallback(() => {
    stopRaf();
    setElapsedMs(0);
    elapsedOnPauseRef.current = 0;
    const prepMs = PREP_SECONDS * 1000;
    prepOnPauseRef.current = 0;
    prepEndAtRef.current = performance.now() + prepMs;
    setPrepRemainingMs(prepMs);
    pausedFromPrepRef.current = false;
    setPhase("prep");
    phaseRef.current = "prep";
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
    setPhase("idle");
    phaseRef.current = "idle";
    startAtRef.current = null;
    prepEndAtRef.current = null;
    elapsedOnPauseRef.current = 0;
    prepOnPauseRef.current = 0;
    pausedFromPrepRef.current = false;
  }, [stopRaf]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const totalMs = config.durationSeconds * 1000;
  const remainingMs = Math.max(0, totalMs - elapsedMs);
  const intervalMs = config.intervalSeconds * 1000;
  const progressInInterval = intervalMs > 0 ? elapsedMs % intervalMs : 0;
  const nextIntervalInMs = intervalMs > 0 ? intervalMs - progressInInterval : 0;
  const totalRounds = Math.max(1, Math.ceil(config.durationSeconds / config.intervalSeconds));
  const currentRound = Math.min(totalRounds, Math.floor(elapsedMs / intervalMs) + 1);

  return {
    config,
    setConfig,
    phase,
    elapsedMs,
    elapsedSeconds: Math.floor(elapsedMs / 1000),
    remainingMs,
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    prepRemainingSeconds: Math.max(0, Math.ceil(prepRemainingMs / 1000)),
    isInPrep: phase === "prep" || (phase === "paused" && pausedFromPrepRef.current),
    currentRound,
    totalRounds,
    nextIntervalInSeconds: Math.max(0, Math.ceil(nextIntervalInMs / 1000)),
    start,
    skipPrep,
    pause,
    resume,
    reset,
  };
}

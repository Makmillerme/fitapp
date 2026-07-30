"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_TABATA_CONFIG,
  loadTabataConfig,
  normalizeTabataConfig,
  PREP_SECONDS,
  saveTabataConfig,
  tabataTotalSeconds,
  type TabataConfig,
} from "@/lib/timer/smart-timer-types";

export type TabataPhase = "idle" | "prep" | "work" | "rest" | "paused" | "done";

export function useTabataTimer() {
  const [config, setConfigState] = useState<TabataConfig>(DEFAULT_TABATA_CONFIG);
  const [uiPhase, setUiPhase] = useState<TabataPhase>("idle");
  const [round, setRound] = useState(1);
  const [remainingMs, setRemainingMs] = useState(0);
  const [segmentMs, setSegmentMs] = useState(0);

  const activeKindRef = useRef<"work" | "rest">("work");
  const roundRef = useRef(1);
  const endAtRef = useRef<number | null>(null);
  const remainingOnPauseRef = useRef(0);
  const pausedFromRef = useRef<"prep" | "work" | "rest">("work");
  const rafRef = useRef<number | null>(null);
  const phaseRef = useRef<TabataPhase>("idle");
  const configRef = useRef(config);

  useEffect(() => {
    setConfigState(loadTabataConfig());
  }, []);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    phaseRef.current = uiPhase;
  }, [uiPhase]);

  const setConfig = useCallback((next: TabataConfig) => {
    const normalized = normalizeTabataConfig(next);
    setConfigState(normalized);
    saveTabataConfig(normalized);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const beginSegment = useCallback(
    (kind: "work" | "rest", roundNum: number) => {
      const cfg = configRef.current;
      const duration =
        (kind === "work" ? cfg.workSeconds : cfg.restSeconds) * 1000;
      activeKindRef.current = kind;
      roundRef.current = roundNum;
      setRound(roundNum);
      setSegmentMs(duration);
      setRemainingMs(duration);
      setUiPhase(kind);
      phaseRef.current = kind;
      endAtRef.current = performance.now() + duration;
    },
    [],
  );

  const advance = useCallback(() => {
    const cfg = configRef.current;
    const kind = activeKindRef.current;
    const currentRound = roundRef.current;

    if (kind === "work") {
      if (currentRound >= cfg.rounds) {
        stopRaf();
        endAtRef.current = null;
        setRemainingMs(0);
        setUiPhase("done");
        phaseRef.current = "done";
        return;
      }
      beginSegment("rest", currentRound);
      return;
    }

    beginSegment("work", currentRound + 1);
  }, [beginSegment, stopRaf]);

  const tick = useCallback(() => {
    const endAt = endAtRef.current;
    if (endAt == null) return;
    const left = Math.max(0, endAt - performance.now());
    setRemainingMs(left);
    if (left <= 0) {
      if (phaseRef.current === "prep") {
        beginSegment("work", 1);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      advance();
      if (endAtRef.current != null) {
        rafRef.current = requestAnimationFrame(tick);
      }
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [advance, beginSegment]);

  const start = useCallback(() => {
    stopRaf();
    const prepMs = PREP_SECONDS * 1000;
    setRound(1);
    roundRef.current = 1;
    setSegmentMs(prepMs);
    setRemainingMs(prepMs);
    remainingOnPauseRef.current = prepMs;
    endAtRef.current = performance.now() + prepMs;
    setUiPhase("prep");
    phaseRef.current = "prep";
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf, tick]);

  const skipPrep = useCallback(() => {
    if (phaseRef.current !== "prep") return;
    stopRaf();
    beginSegment("work", 1);
    rafRef.current = requestAnimationFrame(tick);
  }, [beginSegment, stopRaf, tick]);

  const pause = useCallback(() => {
    if (uiPhase !== "work" && uiPhase !== "rest" && uiPhase !== "prep") return;
    stopRaf();
    const left = endAtRef.current
      ? Math.max(0, endAtRef.current - performance.now())
      : remainingMs;
    remainingOnPauseRef.current = left;
    pausedFromRef.current = uiPhase === "prep" ? "prep" : activeKindRef.current;
    setRemainingMs(left);
    endAtRef.current = null;
    setUiPhase("paused");
    phaseRef.current = "paused";
  }, [remainingMs, stopRaf, uiPhase]);

  const resume = useCallback(() => {
    if (uiPhase !== "paused") return;
    const left = remainingOnPauseRef.current;
    if (left <= 0) {
      if (pausedFromRef.current === "prep") {
        beginSegment("work", 1);
      } else {
        activeKindRef.current = pausedFromRef.current;
        advance();
      }
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    if (pausedFromRef.current === "prep") {
      setUiPhase("prep");
      phaseRef.current = "prep";
    } else {
      activeKindRef.current = pausedFromRef.current;
      setUiPhase(pausedFromRef.current);
      phaseRef.current = pausedFromRef.current;
    }
    endAtRef.current = performance.now() + left;
    rafRef.current = requestAnimationFrame(tick);
  }, [advance, beginSegment, tick, uiPhase]);

  const reset = useCallback(() => {
    stopRaf();
    endAtRef.current = null;
    remainingOnPauseRef.current = 0;
    setRemainingMs(0);
    setSegmentMs(0);
    setRound(1);
    setUiPhase("idle");
    phaseRef.current = "idle";
  }, [stopRaf]);

  const skip = useCallback(() => {
    if (uiPhase === "idle" || uiPhase === "done") return;
    if (uiPhase === "prep") {
      skipPrep();
      return;
    }
    if (uiPhase === "paused") {
      if (pausedFromRef.current === "prep") {
        skipPrep();
        return;
      }
      activeKindRef.current = pausedFromRef.current;
    }
    advance();
    if (endAtRef.current != null) {
      stopRaf();
      rafRef.current = requestAnimationFrame(tick);
      setUiPhase(activeKindRef.current);
      phaseRef.current = activeKindRef.current;
    }
  }, [advance, skipPrep, stopRaf, tick, uiPhase]);

  useEffect(() => () => stopRaf(), [stopRaf]);

  const elapsedMs =
    uiPhase === "idle" || uiPhase === "done"
      ? 0
      : Math.max(0, segmentMs - remainingMs);

  return {
    config,
    setConfig,
    totalSeconds: tabataTotalSeconds(config),
    phase: uiPhase,
    round,
    remainingSeconds: Math.max(0, Math.ceil(remainingMs / 1000)),
    remainingMs,
    elapsedMs,
    isInPrep:
      uiPhase === "prep" ||
      (uiPhase === "paused" && pausedFromRef.current === "prep"),
    start,
    skipPrep,
    pause,
    resume,
    reset,
    skip,
  };
}

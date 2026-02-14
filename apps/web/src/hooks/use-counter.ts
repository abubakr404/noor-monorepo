"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { CounterState } from "@repo/types";

const COUNTER_KEY = "zikr_counter_state";

const DEFAULT_STATE: CounterState = {
  current: 0,
  target: 33,
  presetId: null,
  customLabel: null,
};

function isValidCounterState(data: unknown): data is CounterState {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.current === "number" && typeof obj.target === "number";
}

export interface UseCounterReturn extends CounterState {
  increment: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
  selectPreset: (
    presetId: string,
    target: number,
    customLabel?: string,
  ) => void;
}

export function useCounter(isAuthenticated: boolean): UseCounterReturn {
  const [state, setState] = useState<CounterState>(DEFAULT_STATE);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(COUNTER_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidCounterState(parsed)) {
          setState(parsed);
        }
      }
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  /* Persist on every change */
  useEffect(() => {
    try {
      localStorage.setItem(COUNTER_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded */
    }
  }, [state]);

  const syncToApi = useCallback((s: CounterState) => {
    if (!isAuthRef.current) return;
    apiClient.saveCounter(s).catch(() => {});
  }, []);

  const increment = useCallback(() => {
    setState((prev) => {
      const next: CounterState = { ...prev, current: prev.current + 1 };
      // Defer sync to avoid side-effect in updater
      queueMicrotask(() => syncToApi(next));
      return next;
    });
  }, [syncToApi]);

  const reset = useCallback(() => {
    setState((prev) => {
      const next: CounterState = { ...prev, current: 0 };
      queueMicrotask(() => syncToApi(next));
      return next;
    });
  }, [syncToApi]);

  const setTarget = useCallback(
    (target: number) => {
      const next: CounterState = { ...state, target, current: 0 };
      setState(next);
      syncToApi(next);
    },
    [state, syncToApi],
  );

  const selectPreset = useCallback(
    (presetId: string, target: number, customLabel?: string) => {
      const next: CounterState = {
        current: 0,
        target,
        presetId,
        customLabel: customLabel ?? null,
      };
      setState(next);
      syncToApi(next);
    },
    [syncToApi],
  );

  return { ...state, increment, reset, setTarget, selectPreset };
}

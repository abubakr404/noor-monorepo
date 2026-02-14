import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../services/api";
import { StorageKeys, getJSON, setJSON } from "../services/storage";
import type { CounterState } from "@repo/types";

const DEFAULT_STATE: CounterState = {
  current: 0,
  target: 33,
  presetId: null,
  customLabel: null,
};

export function useCounter(isAuthenticated: boolean) {
  const [state, setState] = useState<CounterState>(DEFAULT_STATE);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<CounterState>(StorageKeys.COUNTER_STATE);
      if (stored && typeof stored.current === "number") {
        setState(stored);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setJSON(StorageKeys.COUNTER_STATE, state);
  }, [state]);

  const syncToApi = useCallback((s: CounterState) => {
    if (!isAuthRef.current) return;
    api.saveCounter(s).catch(() => {});
  }, []);

  const increment = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, current: prev.current + 1 };
      queueMicrotask(() => syncToApi(next));
      return next;
    });
  }, [syncToApi]);

  const reset = useCallback(() => {
    setState((prev) => {
      const next = { ...prev, current: 0 };
      queueMicrotask(() => syncToApi(next));
      return next;
    });
  }, [syncToApi]);

  const setTarget = useCallback(
    (target: number) => {
      const next = { ...state, target, current: 0 };
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

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { ZikrCategory } from "@repo/types";

/* ── Local shape (flat, per-category) ──────────────────── */

export interface CategoryProgress {
  completed: number[];
  inProgress: Record<number, number>;
}

export interface DailyProgressLocal {
  date: string;
  morning: CategoryProgress;
  evening: CategoryProgress;
  night: CategoryProgress;
}

const PROGRESS_KEY = "zikr_daily_progress";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

function emptyCategory(): CategoryProgress {
  return { completed: [], inProgress: {} };
}

function emptyProgress(): DailyProgressLocal {
  return {
    date: getTodayDate(),
    morning: emptyCategory(),
    evening: emptyCategory(),
    night: emptyCategory(),
  };
}

function isValidProgress(data: unknown): data is DailyProgressLocal {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.date !== "string") return false;
  for (const key of ["morning", "evening", "night"] as const) {
    const cat = obj[key];
    if (typeof cat !== "object" || cat === null) return false;
    const c = cat as Record<string, unknown>;
    if (!Array.isArray(c.completed)) return false;
    if (typeof c.inProgress !== "object" || c.inProgress === null) return false;
  }
  return true;
}

export interface UseProgressReturn {
  progress: DailyProgressLocal;
  markZikrComplete: (category: ZikrCategory, zikrId: number) => void;
  updateInProgress: (
    category: ZikrCategory,
    zikrId: number,
    count: number,
  ) => void;
  resetCategory: (category: ZikrCategory) => void;
}

export function useProgress(isAuthenticated: boolean): UseProgressReturn {
  const [progress, setProgress] = useState<DailyProgressLocal>(emptyProgress);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidProgress(parsed) && parsed.date === getTodayDate()) {
          setProgress(parsed);
        } else {
          setProgress(emptyProgress());
        }
      }
    } catch {
      setProgress(emptyProgress());
    }
  }, []);

  /* Persist to localStorage on every change */
  useEffect(() => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    } catch {
      /* quota exceeded — ignore */
    }
  }, [progress]);

  /* Background API sync (fire-and-forget) — called OUTSIDE setState */
  const syncToApi = useCallback(
    (category: ZikrCategory, cat: CategoryProgress) => {
      if (!isAuthRef.current) return;
      apiClient
        .upsertProgress({
          date: getTodayDate(),
          category,
          completedIds: cat.completed,
          inProgress: cat.inProgress,
        })
        .catch(() => {});
    },
    [],
  );

  const markZikrComplete = useCallback(
    (category: ZikrCategory, zikrId: number) => {
      setProgress((prev) => {
        const cat = { ...prev[category] };
        if (!cat.completed.includes(zikrId)) {
          cat.completed = [...cat.completed, zikrId];
        }
        const { [zikrId]: _, ...rest } = cat.inProgress;
        cat.inProgress = rest;
        return { ...prev, [category]: cat };
      });
      // Sync after state update (outside updater)
      setProgress((current) => {
        syncToApi(category, current[category]);
        return current; // no-op update
      });
    },
    [syncToApi],
  );

  const updateInProgress = useCallback(
    (category: ZikrCategory, zikrId: number, count: number) => {
      setProgress((prev) => {
        const cat = { ...prev[category] };
        cat.inProgress = { ...cat.inProgress, [zikrId]: count };
        return { ...prev, [category]: cat };
      });
      setProgress((current) => {
        syncToApi(category, current[category]);
        return current;
      });
    },
    [syncToApi],
  );

  const resetCategory = useCallback(
    (category: ZikrCategory) => {
      const empty = emptyCategory();
      setProgress((prev) => ({ ...prev, [category]: empty }));
      syncToApi(category, empty);
    },
    [syncToApi],
  );

  return { progress, markZikrComplete, updateInProgress, resetCategory };
}

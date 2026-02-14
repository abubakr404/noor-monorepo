import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../services/api";
import { StorageKeys, getJSON, setJSON } from "../services/storage";
import type { ZikrCategory } from "@repo/types";

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

export function useProgress(isAuthenticated: boolean) {
  const [progress, setProgress] = useState<DailyProgressLocal>(emptyProgress);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<DailyProgressLocal>(
        StorageKeys.DAILY_PROGRESS,
      );
      if (stored && stored.date === getTodayDate()) {
        setProgress(stored);
      } else {
        setProgress(emptyProgress());
      }
    };
    load();
  }, []);

  useEffect(() => {
    setJSON(StorageKeys.DAILY_PROGRESS, progress);
  }, [progress]);

  const syncToApi = useCallback(
    (category: ZikrCategory, cat: CategoryProgress) => {
      if (!isAuthRef.current) return;
      api
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
        const next = { ...prev, [category]: cat };
        queueMicrotask(() => syncToApi(category, cat));
        return next;
      });
    },
    [syncToApi],
  );

  const updateInProgress = useCallback(
    (category: ZikrCategory, zikrId: number, count: number) => {
      setProgress((prev) => {
        const cat = { ...prev[category] };
        cat.inProgress = { ...cat.inProgress, [zikrId]: count };
        queueMicrotask(() => syncToApi(category, cat));
        return { ...prev, [category]: cat };
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

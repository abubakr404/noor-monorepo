"use client";

import { useState, useEffect, useCallback } from "react";

const STREAK_KEY = "zikr_streak";

interface StreakState {
  count: number;
  lastDate: string | null;
}

function isValidStreak(data: unknown): data is StreakState {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.count === "number" &&
    (obj.lastDate === null || typeof obj.lastDate === "string")
  );
}

export interface UseStreakReturn {
  streak: number;
  lastDate: string | null;
  checkAndUpdateStreak: () => void;
}

/**
 * Tracks the daily completion streak locally.
 * Streak is synced to API via the progress hook, not directly here.
 */
export function useStreak(): UseStreakReturn {
  const [state, setState] = useState<StreakState>({
    count: 0,
    lastDate: null,
  });

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STREAK_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidStreak(parsed)) {
          setState(parsed);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Persist on every change */
  useEffect(() => {
    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(state));
    } catch {
      /* quota exceeded */
    }
  }, [state]);

  const checkAndUpdateStreak = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]!;

    setState((prev) => {
      if (prev.lastDate === today) return prev; // Already counted today

      const yesterday = new Date(Date.now() - 86_400_000)
        .toISOString()
        .split("T")[0]!;
      const isConsecutive = prev.lastDate === yesterday;

      return {
        count: isConsecutive ? prev.count + 1 : 1,
        lastDate: today,
      };
    });
  }, []);

  return {
    streak: state.count,
    lastDate: state.lastDate,
    checkAndUpdateStreak,
  };
}

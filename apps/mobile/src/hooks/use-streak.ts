import { useState, useEffect, useCallback } from "react";
import { StorageKeys, getJSON, setJSON } from "../services/storage";

interface StreakState {
  count: number;
  lastDate: string | null;
}

export function useStreak() {
  const [state, setState] = useState<StreakState>({
    count: 0,
    lastDate: null,
  });

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<StreakState>(StorageKeys.STREAK);
      if (stored && typeof stored.count === "number") {
        setState(stored);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setJSON(StorageKeys.STREAK, state);
  }, [state]);

  const checkAndUpdateStreak = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]!;
    setState((prev) => {
      if (prev.lastDate === today) return prev;
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

  return { streak: state.count, lastDate: state.lastDate, checkAndUpdateStreak };
}

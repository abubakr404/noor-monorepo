import { useState, useEffect } from "react";
import { getCurrentTimePeriod } from "@repo/utils";
import type { ZikrCategory } from "@repo/types";

export function useTimePeriod(): ZikrCategory {
  const [period, setPeriod] = useState<ZikrCategory>(getCurrentTimePeriod());

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getCurrentTimePeriod());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return period;
}

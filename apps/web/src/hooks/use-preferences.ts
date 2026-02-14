"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";
import type { UserPreferences } from "@repo/types";

const PREFS_KEY = "zikr_preferences";

const DEFAULTS: UserPreferences = {
  language: "ar",
  theme: "system",
  counterMode: "interactive",
  soundEnabled: true,
  vibrationEnabled: true,
};

const VALID_LANGUAGES = new Set(["ar", "en"]);
const VALID_THEMES = new Set(["light", "dark", "system"]);
const VALID_COUNTER_MODES = new Set(["interactive", "display"]);

function isValidPreferences(data: unknown): data is Partial<UserPreferences> {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (obj.language !== undefined && !VALID_LANGUAGES.has(String(obj.language)))
    return false;
  if (obj.theme !== undefined && !VALID_THEMES.has(String(obj.theme)))
    return false;
  if (
    obj.counterMode !== undefined &&
    !VALID_COUNTER_MODES.has(String(obj.counterMode))
  )
    return false;
  return true;
}

export interface UsePreferencesReturn extends UserPreferences {
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => void;
}

export function usePreferences(
  isAuthenticated: boolean,
): UsePreferencesReturn {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (isValidPreferences(parsed)) {
          setPrefs({ ...DEFAULTS, ...parsed });
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Persist on every change */
  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* quota exceeded */
    }
  }, [prefs]);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      // Sync after state update — outside updater
      if (isAuthRef.current) {
        apiClient.updatePreferences({ [key]: value }).catch(() => {});
      }
    },
    [],
  );

  return { ...prefs, updatePreference };
}

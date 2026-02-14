import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../services/api";
import { StorageKeys, getJSON, setJSON } from "../services/storage";
import type { UserPreferences } from "@repo/types";

const DEFAULTS: UserPreferences = {
  language: "ar",
  theme: "dark",
  counterMode: "interactive",
  soundEnabled: true,
  vibrationEnabled: true,
};

export function usePreferences(isAuthenticated: boolean) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<Partial<UserPreferences>>(
        StorageKeys.PREFERENCES,
      );
      if (stored) {
        setPrefs({ ...DEFAULTS, ...stored });
      }
    };
    load();
  }, []);

  useEffect(() => {
    setJSON(StorageKeys.PREFERENCES, prefs);
  }, [prefs]);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
      if (isAuthRef.current) {
        api.updatePreferences({ [key]: value }).catch(() => {});
      }
    },
    [],
  );

  return { ...prefs, updatePreference };
}

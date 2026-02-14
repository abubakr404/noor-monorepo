/**
 * Typed AsyncStorage wrapper for the mobile app.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  ACCESS_TOKEN: "zikr_access_token",
  REFRESH_TOKEN: "zikr_refresh_token",
  DAILY_PROGRESS: "zikr_daily_progress",
  COUNTER_STATE: "zikr_counter_state",
  FAVORITES: "zikr_favorites",
  STREAK: "zikr_streak",
  PREFERENCES: "zikr_preferences",
  AZKAR_VERSION: "zikr_data_version",
  AZKAR_CACHE: "zikr_azkar_cache",
} as const;

export async function getItem(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    /* ignore quota errors */
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON(key: string, value: unknown): Promise<void> {
  await setItem(key, JSON.stringify(value));
}

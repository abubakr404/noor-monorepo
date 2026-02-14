/**
 * Offline-first data service for the mobile app.
 *
 * The app bundles hardcoded azkar from @repo/data as the default dataset.
 * When online, it checks the API for a newer version and syncs if needed.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  morningAzkar,
  eveningAzkar,
  nightAzkar,
  counterPresets,
} from "@repo/data";
import type { SeedZikr, SeedCounterPreset } from "@repo/data";
import type { ZikrCategory } from "@repo/types";

const AZKAR_VERSION_KEY = "zikr_data_version";
const AZKAR_CACHE_KEY = "zikr_azkar_cache";

/**
 * Returns azkar for the given category from the bundled data.
 */
export function getBundledAzkar(category: ZikrCategory): SeedZikr[] {
  switch (category) {
    case "morning":
      return morningAzkar;
    case "evening":
      return eveningAzkar;
    case "night":
      return nightAzkar;
    default:
      return [];
  }
}

/**
 * Returns bundled counter presets.
 */
export function getBundledPresets(): SeedCounterPreset[] {
  return counterPresets;
}

/**
 * Get the locally stored data version.
 */
export async function getLocalVersion(): Promise<number> {
  try {
    const v = await AsyncStorage.getItem(AZKAR_VERSION_KEY);
    return v ? Number(v) : 0;
  } catch {
    return 0;
  }
}

/**
 * Store the data version locally.
 */
export async function setLocalVersion(version: number): Promise<void> {
  try {
    await AsyncStorage.setItem(AZKAR_VERSION_KEY, String(version));
  } catch {
    /* ignore */
  }
}

/**
 * Cache azkar data for offline use.
 */
export async function cacheAzkar(
  category: ZikrCategory,
  data: unknown,
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      `${AZKAR_CACHE_KEY}_${category}`,
      JSON.stringify(data),
    );
  } catch {
    /* ignore */
  }
}

/**
 * Get cached azkar data. Returns null if not cached.
 */
export async function getCachedAzkar(
  category: ZikrCategory,
): Promise<unknown | null> {
  try {
    const cached = await AsyncStorage.getItem(
      `${AZKAR_CACHE_KEY}_${category}`,
    );
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

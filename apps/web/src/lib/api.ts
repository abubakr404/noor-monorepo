import type { ApiResponse } from "@repo/types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Typed API client for the Zikr NestJS backend.
 * All responses are wrapped in { success, data } or { success: false, error }.
 */
export async function apiClient<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = (await res.json()) as ApiResponse<T>;

  if (!json.success) {
    throw new Error(json.error.message);
  }

  return json.data;
}

// ─── Auth ────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  name?: string,
) {
  return apiClient<{ accessToken: string; refreshToken: string }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    },
  );
}

export async function login(email: string, password: string) {
  return apiClient<{ accessToken: string; refreshToken: string }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
}

export async function refreshToken(refreshTokenStr: string) {
  return apiClient<{ accessToken: string; refreshToken: string }>(
    "/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken: refreshTokenStr }),
    },
  );
}

export async function getMe() {
  return apiClient<{
    id: string;
    email: string;
    name: string | null;
    provider: string;
    avatarUrl: string | null;
  }>("/auth/me");
}

// ─── Azkar ───────────────────────────────────────────────

import type { Zikr, CounterPreset, ContentVersionInfo } from "@repo/types";

export async function getAzkarByCategory(category: string) {
  return apiClient<Zikr[]>(`/azkar?category=${category}`);
}

export async function getAllAzkar() {
  return apiClient<Zikr[]>("/azkar/all");
}

export async function getAzkarVersion() {
  return apiClient<ContentVersionInfo>("/azkar/version");
}

export async function getCounterPresets() {
  return apiClient<CounterPreset[]>("/counter-presets");
}

// ─── Progress ────────────────────────────────────────────

import type { DailyProgress, StreakInfo, ProgressUpdate } from "@repo/types";

export async function getDailyProgress(date: string) {
  return apiClient<DailyProgress[]>(`/progress?date=${date}`);
}

export async function upsertProgress(update: ProgressUpdate) {
  return apiClient<{ progress: DailyProgress; streak: StreakInfo }>(
    "/progress",
    {
      method: "PUT",
      body: JSON.stringify(update),
    },
  );
}

export async function getStreak() {
  return apiClient<StreakInfo>("/progress/streak");
}

// ─── Counter ─────────────────────────────────────────────

import type { CounterState, CounterUpdate } from "@repo/types";

export async function getCounterState() {
  return apiClient<CounterState>("/counter");
}

export async function saveCounterState(update: CounterUpdate) {
  return apiClient<CounterState>("/counter", {
    method: "PUT",
    body: JSON.stringify(update),
  });
}

// ─── Favorites ───────────────────────────────────────────

import type { Favorite } from "@repo/types";

export async function getFavorites() {
  return apiClient<Favorite[]>("/favorites");
}

export async function addFavorite(zikrId: number) {
  return apiClient<{ success: boolean }>(`/favorites/${zikrId}`, {
    method: "POST",
  });
}

export async function removeFavorite(zikrId: number) {
  return apiClient<{ success: boolean }>(`/favorites/${zikrId}`, {
    method: "DELETE",
  });
}

// ─── Preferences ─────────────────────────────────────────

import type { UserPreferences, PreferencesUpdate } from "@repo/types";

export async function getPreferences() {
  return apiClient<UserPreferences>("/preferences");
}

export async function updatePreferences(update: PreferencesUpdate) {
  return apiClient<UserPreferences>("/preferences", {
    method: "PATCH",
    body: JSON.stringify(update),
  });
}

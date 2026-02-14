/**
 * Full typed API client for the mobile app.
 */
import type {
  Zikr,
  CounterPreset,
  ContentVersionInfo,
  DailyProgress,
  StreakInfo,
  CounterState,
  CounterUpdate,
  ProgressUpdate,
  AuthTokens,
  UserPreferences,
  PreferencesUpdate,
  RegisterDto,
  LoginDto,
  ApiResponse,
  Favorite,
  ZikrCategory,
} from "@repo/types";
import { StorageKeys, getItem, setItem } from "./storage";

// LAN IP for real device testing (both phone and PC must be on same network)
// Change this to your computer's IP if it changes
const API_URL = "http://10.234.198.199:3001/api/v1";

let accessToken: string | null = null;

export function setToken(token: string | null): void {
  accessToken = token;
}

export async function restoreToken(): Promise<string | null> {
  accessToken = await getItem(StorageKeys.ACCESS_TOKEN);
  return accessToken;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string> | undefined) ?? {}),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body: unknown = await res.json().catch(() => ({
      message: res.statusText,
    }));
    const msg =
      typeof body === "object" && body !== null
        ? ((body as Record<string, unknown>).error as Record<string, unknown>)
            ?.message ??
          (body as Record<string, unknown>).message ??
          "Request failed"
        : "Request failed";
    throw new Error(String(msg));
  }

  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.error.message);
  return json.data;
}

/* ── Auth ── */

export function register(dto: RegisterDto): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function login(dto: LoginDto): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function refresh(refreshToken: string): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  avatarUrl: string | null;
  createdAt: string;
}

export function getMe(): Promise<UserProfile> {
  return request<UserProfile>("/auth/me");
}

/* ── Azkar ── */

export function fetchAzkar(category: ZikrCategory): Promise<Zikr[]> {
  return request<Zikr[]>(`/azkar?category=${category}`);
}

export function fetchAllAzkar(): Promise<Zikr[]> {
  return request<Zikr[]>("/azkar/all");
}

export function fetchAzkarVersion(): Promise<ContentVersionInfo> {
  return request<ContentVersionInfo>("/azkar/version");
}

export function fetchCounterPresets(): Promise<CounterPreset[]> {
  return request<CounterPreset[]>("/counter-presets");
}

/* ── Progress ── */

export function getProgress(date: string): Promise<DailyProgress[]> {
  return request<DailyProgress[]>(`/progress?date=${date}`);
}

export function upsertProgress(data: ProgressUpdate): Promise<DailyProgress> {
  return request<DailyProgress>("/progress", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getStreak(): Promise<StreakInfo> {
  return request<StreakInfo>("/progress/streak");
}

/* ── Counter ── */

export function getCounter(): Promise<CounterState> {
  return request<CounterState>("/counter");
}

export function saveCounter(data: CounterUpdate): Promise<CounterState> {
  return request<CounterState>("/counter", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* ── Favorites ── */

export function getFavorites(): Promise<Favorite[]> {
  return request<Favorite[]>("/favorites");
}

export function addFavorite(zikrId: number): Promise<Favorite> {
  return request<Favorite>(`/favorites/${zikrId}`, { method: "POST" });
}

export function removeFavorite(zikrId: number): Promise<void> {
  return request<void>(`/favorites/${zikrId}`, { method: "DELETE" });
}

/* ── Preferences ── */

export function getPreferences(): Promise<UserPreferences> {
  return request<UserPreferences>("/preferences");
}

export function updatePreferences(
  data: PreferencesUpdate,
): Promise<UserPreferences> {
  return request<UserPreferences>("/preferences", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

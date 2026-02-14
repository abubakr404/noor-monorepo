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
} from "@repo/types";

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  avatarUrl: string | null;
  createdAt: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const API_PREFIX = "/api/v1";

/**
 * Singleton typed API client for the Zikr NestJS backend.
 *
 * - Call `apiClient.setToken(jwt)` after login to attach the Authorization header.
 * - Every endpoint returns the **unwrapped** `data` field from the API envelope.
 */
class ApiClient {
  private token: string | null = null;

  /** Attach / clear the JWT used for protected endpoints. */
  setToken(token: string | null): void {
    this.token = token;
  }

  /* ── Private transport ────────────────────────────────── */

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
      ...options,
      headers,
    });

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
    if (!json.success) {
      throw new Error(json.error.message);
    }
    return json.data;
  }

  /* ── Auth (public) ────────────────────────────────────── */

  register(dto: RegisterDto): Promise<AuthTokens> {
    return this.request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  login(dto: LoginDto): Promise<AuthTokens> {
    return this.request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  googleLogin(idToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }

  appleLogin(identityToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>("/auth/apple", {
      method: "POST",
      body: JSON.stringify({ identityToken }),
    });
  }

  getMe(): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/me");
  }

  /* ── Azkar (public) ───────────────────────────────────── */

  getAzkar(category: string): Promise<Zikr[]> {
    return this.request<Zikr[]>(`/azkar?category=${category}`);
  }

  getAllAzkar(): Promise<Zikr[]> {
    return this.request<Zikr[]>("/azkar/all");
  }

  getAzkarVersion(): Promise<ContentVersionInfo> {
    return this.request<ContentVersionInfo>("/azkar/version");
  }

  getCounterPresets(): Promise<CounterPreset[]> {
    return this.request<CounterPreset[]>("/counter-presets");
  }

  /* ── Progress (protected) ─────────────────────────────── */

  getProgress(date: string): Promise<DailyProgress[]> {
    return this.request<DailyProgress[]>(`/progress?date=${date}`);
  }

  upsertProgress(data: ProgressUpdate): Promise<DailyProgress> {
    return this.request<DailyProgress>("/progress", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  getStreak(): Promise<StreakInfo> {
    return this.request<StreakInfo>("/progress/streak");
  }

  /* ── Counter (protected) ──────────────────────────────── */

  getCounter(): Promise<CounterState> {
    return this.request<CounterState>("/counter");
  }

  saveCounter(data: CounterUpdate): Promise<CounterState> {
    return this.request<CounterState>("/counter", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  /* ── Favorites (protected) ────────────────────────────── */

  getFavorites(): Promise<Favorite[]> {
    return this.request<Favorite[]>("/favorites");
  }

  addFavorite(zikrId: number): Promise<Favorite> {
    return this.request<Favorite>(`/favorites/${zikrId}`, {
      method: "POST",
    });
  }

  removeFavorite(zikrId: number): Promise<void> {
    return this.request<void>(`/favorites/${zikrId}`, {
      method: "DELETE",
    });
  }

  /* ── Preferences (protected) ──────────────────────────── */

  getPreferences(): Promise<UserPreferences> {
    return this.request<UserPreferences>("/preferences");
  }

  updatePreferences(data: PreferencesUpdate): Promise<UserPreferences> {
    return this.request<UserPreferences>("/preferences", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();

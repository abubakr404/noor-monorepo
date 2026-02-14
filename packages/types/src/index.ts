// ─── Enums & Unions ──────────────────────────────────────

export type Theme = "light" | "dark" | "system";
export type Language = "en" | "ar";
export type ZikrCategory = "morning" | "evening" | "night";
export type AuthProvider = "local" | "google" | "apple";
export type CounterMode = "interactive" | "display";

// ─── Auth ────────────────────────────────────────────────

export interface User {
  readonly id: string;
  email: string | null;
  name: string | null;
  provider: AuthProvider;
  providerId: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface GoogleAuthDto {
  idToken: string;
}

export interface AppleAuthDto {
  identityToken: string;
  fullName?: string;
}

// ─── Azkar ───────────────────────────────────────────────

export interface Zikr {
  readonly id: number;
  arabicText: string;
  arabicTextClean: string | null;
  translationEn: string | null;
  translationAr: string | null;
  transliteration: string | null;
  repeatCount: number;
  reference: string | null;
  virtueAr: string | null;
  virtueEn: string | null;
  category: ZikrCategory;
  orderIndex: number;
}

export interface CounterPreset {
  readonly id: string;
  labelAr: string;
  labelEn: string;
  targetCount: number;
  orderIndex: number;
}

export interface ContentVersionInfo {
  key: string;
  version: number;
  updatedAt: string;
}

// ─── Progress ────────────────────────────────────────────

export interface DailyProgress {
  readonly id: string;
  userId: string;
  date: string;
  category: ZikrCategory;
  completedIds: number[];
  inProgress: Record<number, number>;
}

export interface ProgressUpdate {
  date: string;
  category: ZikrCategory;
  completedIds: number[];
  inProgress: Record<number, number>;
}

export interface StreakInfo {
  count: number;
  lastDate: string;
}

// ─── Counter ─────────────────────────────────────────────

export interface CounterState {
  current: number;
  target: number;
  presetId: string | null;
  customLabel: string | null;
}

export interface CounterUpdate {
  current: number;
  target: number;
  presetId?: string | null;
  customLabel?: string | null;
}

// ─── Favorites ───────────────────────────────────────────

export interface Favorite {
  readonly id: string;
  userId: string;
  zikrId: number;
}

// ─── Preferences ─────────────────────────────────────────

export interface UserPreferences {
  language: Language;
  theme: Theme;
  counterMode: CounterMode;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface PreferencesUpdate {
  language?: Language;
  theme?: Theme;
  counterMode?: CounterMode;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

// ─── API Response Wrapper ────────────────────────────────

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    statusCode: number;
    message: string;
    error: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Time Period Detection ───────────────────────────────

export interface TimePeriod {
  category: ZikrCategory;
  label: string;
  labelAr: string;
  isActive: boolean;
}

# Zikr Web App — Next.js 14 Step-by-Step Implementation Plan

> **Scope**: Every step needed to build the Next.js 14 web app from the existing skeleton to a fully functional, gold-themed Zikr application. All azkar data is fetched from the NestJS API (port 3001). User state uses localStorage for instant UX with background API sync when logged in.

---

## Summary Table

| Metric | Value |
|---|---|
| **Pages** | 8 — Home, Azkar/[category], Azkar/[category]/[id], Counter, Favorites, Settings, Auth/Login, Auth/Register |
| **Custom Components** | 10+ — ZikrCard, PeriodCard, ProgressHeader, StreakBadge, ZikrCounter, CounterCircle, BottomNav, AuthDialog, StarBadge, etc. |
| **Custom Hooks** | 8 — useAuth, useAzkar, useTimePeriod, useProgress, useCounter, useFavorites, useStreak, usePreferences |
| **Shared Packages** | `@repo/types`, `@repo/ui`, `@repo/utils`, `@repo/config`, `@repo/data` |
| **Stack** | Next.js 14.1 App Router, next-intl 3.9, next-themes, Tailwind CSS, TanStack Query, Tajawal font |
| **Design** | Gold-dominant palette (Golden Quran aesthetic), Islamic geometric background, 8-pointed star badge |
| **API** | NestJS on port 3001 — web fetches ALL data from API, no hardcoded azkar |
| **State** | localStorage for instant UX + background API sync when authenticated |

### Existing Files (already in repo)

| File | Status |
|---|---|
| `apps/web/src/app/[locale]/layout.tsx` | Has i18n, ThemeProvider, Cairo font — needs update |
| `apps/web/src/app/[locale]/page.tsx` | Placeholder — needs full rewrite |
| `apps/web/src/middleware.ts` | next-intl middleware — OK |
| `apps/web/src/i18n.ts` | Server i18n config — OK |
| `apps/web/src/navigation.ts` | Shared navigation helpers — OK |
| `apps/web/src/lib/api.ts` | Basic fetchApi/fetchStrapi — needs replacement with typed client |
| `apps/web/src/lib/fonts.ts` | Cairo font — needs update to Tajawal |
| `apps/web/src/components/theme-provider.tsx` | next-themes wrapper — OK |
| `apps/web/src/app/globals.css` | Default Shadcn vars — needs gold overhaul |
| `apps/web/tailwind.config.ts` | Already uses shared preset — needs content paths update |

---

## Phase 1: Shared Packages Setup (before web work)

> These packages are consumed by both web and mobile. Must be created before building any web pages.

### Step 1 — Create design tokens

- [ ] **File**: `packages/config/tailwind/design-tokens.js`
- Gold color scale (50–950), warm dark/light backgrounds, border-radius, fontFamily, fontSize

```javascript
// packages/config/tailwind/design-tokens.js
module.exports = {
  colors: {
    gold: {
      50: "#FFFBEB",
      100: "#FEF3C7",
      200: "#FDE68A",
      300: "#FCD34D",
      400: "#FBBF24",
      500: "#F59E0B",   // main
      600: "#D97706",
      700: "#B45309",
      800: "#92400E",
      900: "#78350F",
      950: "#451A03",
    },
    dark: {
      base: "#0D0B08",
      card: "#1A1510",
      elevated: "#262015",
      surface: "#332B1E",
    },
    light: {
      base: "#FFFBF5",
      card: "#FFFFFF",
      surface: "#FEF8F0",
    },
  },
  borderRadius: {
    sm: "6px",
    DEFAULT: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  fontFamily: {
    tajawal: ["Tajawal", "sans-serif"],
  },
  fontSize: {
    "zikr-xl": ["32px", { lineHeight: "1.5", fontWeight: "700" }],
    "zikr-lg": ["24px", { lineHeight: "1.5", fontWeight: "600" }],
    body: ["16px", { lineHeight: "1.6", fontWeight: "400" }],
    caption: ["12px", { lineHeight: "1.4", fontWeight: "400" }],
  },
};
```

---

### Step 2 — Create Tailwind preset

- [ ] **File**: `packages/config/tailwind/tailwind.preset.js`
- Tailwind preset that extends theme with design tokens

```javascript
// packages/config/tailwind/tailwind.preset.js
const tokens = require("./design-tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: tokens.colors,
      borderRadius: tokens.borderRadius,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
    },
  },
};
```

---

### Step 3 — Create config/tailwind index

- [ ] **File**: `packages/config/tailwind/index.js`
- Re-exports the preset for consumer apps

```javascript
module.exports = require("./tailwind.preset");
```

---

### Step 4 — Create shared Zikr types

- [ ] **File**: `packages/types/src/zikr.ts`
- Core data types: Zikr, CounterPreset, CategoryProgress, DailyProgress, CounterState, TimePeriod

```typescript
export type TimePeriod = "morning" | "evening" | "night";

export interface Zikr {
  id: number;
  arabicText: string;
  arabicTextClean?: string;
  translation: { ar?: string; en: string };
  transliteration?: string;
  repeatCount: number;
  reference?: string;
  virtue?: { ar?: string; en?: string };
  category: TimePeriod;
  order: number;
  audioUrl?: string;
}

export interface CounterPreset {
  id: string;
  label: { ar: string; en: string };
  targetCount: number;
  order: number;
}

export interface CategoryProgress {
  completed: number[];                    // Array of completed zikr IDs
  inProgress: Record<number, number>;     // zikrId -> current count
}

export interface DailyProgress {
  date: string;                           // ISO date "2026-02-12"
  morning: CategoryProgress;
  evening: CategoryProgress;
  night: CategoryProgress;
}

export interface CounterState {
  current: number;
  target: number;
  presetId?: string;
  customLabel?: string;
}
```

---

### Step 5 — Create shared Auth types

- [ ] **File**: `packages/types/src/auth.ts`
- DTOs and response types for authentication

```typescript
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  avatarUrl: string | null;
  createdAt: string;
}
```

---

### Step 6 — Create shared Preferences types

- [ ] **File**: `packages/types/src/preferences.ts`
- User preferences with counter mode

```typescript
export interface UserPreferences {
  language: "ar" | "en";
  theme: "light" | "dark" | "system";
  counterMode: "interactive" | "display";
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}
```

---

### Step 7 — Create shared API response types

- [ ] **File**: `packages/types/src/api.ts`
- Generic wrappers for API responses

```typescript
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface VersionedContent<T> {
  data: T;
  version: number;
}
```

---

### Step 8 — Update types index with re-exports

- [ ] **File**: `packages/types/src/index.ts`
- Re-export all type modules

```typescript
export * from "./zikr";
export * from "./auth";
export * from "./preferences";
export * from "./api";
```

---

### Step 9 — Create `packages/data/` seed data package

- [ ] **File**: `packages/data/package.json` — `@repo/data`
- [ ] **File**: `packages/data/src/azkar/morning.json` — ~15 morning azkar with full tashkeel
- [ ] **File**: `packages/data/src/azkar/evening.json` — ~15 evening azkar with full tashkeel
- [ ] **File**: `packages/data/src/azkar/night.json` — ~10 night azkar with full tashkeel
- [ ] **File**: `packages/data/src/counter/presets.json` — SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), La ilaha illallah (100)
- [ ] **File**: `packages/data/src/version.ts` — `export const DATA_VERSION = 1;`
- [ ] **File**: `packages/data/src/index.ts` — Re-exports all data + version

Each azkar JSON item shape:

```json
{
  "id": 1,
  "arabicText": "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
  "translation": { "en": "Allah! There is no deity except Him, the Ever-Living..." },
  "transliteration": "Allahu la ilaha illa Huwal-Hayyul-Qayyum...",
  "repeatCount": 1,
  "reference": "Quran 2:255 (Ayat al-Kursi)",
  "virtue": { "en": "Whoever recites it in the morning will be protected until evening", "ar": "من قرأها في الصباح أُجير من الجن حتى يمسي" },
  "category": "morning",
  "order": 1
}
```

**Purpose**: Seeds the NestJS database AND serves as mobile offline fallback. Web fetches from API only.

---

### Step 10 — Create time utilities

- [ ] **File**: `packages/utils/src/time.ts`
- `getCurrentTimePeriod()` returns `'morning'|'evening'|'night'` based on current hour
- `getGreeting(period, locale)` returns Arabic/English time-based greeting

```typescript
import type { TimePeriod } from "@repo/types";

export function getCurrentTimePeriod(): TimePeriod {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "evening";
  return "night";
}

export function getGreeting(period: TimePeriod, locale: "ar" | "en"): string {
  const greetings: Record<TimePeriod, { ar: string; en: string }> = {
    morning: { ar: "صباح الخير", en: "Good morning" },
    evening: { ar: "مساء الخير", en: "Good evening" },
    night: { ar: "تصبح على خير", en: "Good night" },
  };
  return greetings[period][locale];
}
```

---

### Step 11 — Create version utility

- [ ] **File**: `packages/utils/src/version.ts`
- Helper for content versioning (mobile sync)

```typescript
export function shouldUpdate(localVersion: number, serverVersion: number): boolean {
  return serverVersion > localVersion;
}
```

---

### Step 12 — Add Shadcn/ui components to `packages/ui`

- [ ] Add via Shadcn CLI or manually:
  - Card, Badge, Progress, Tabs, Dialog, Sheet, Toggle, ScrollArea, Separator, Avatar, Input, Label
- All go into `packages/ui/src/components/ui/`
- Re-export from `packages/ui/src/components/index.ts`

---

### Step 13 — Create Islamic geometric background SVG

- [ ] **File**: `packages/ui/src/assets/patterns/arabesque.svg`
- A single repeating geometric tile (interlocking 8-pointed stars and lines, mashrabiya style)
- Used as subtle background texture on page containers
- Light mode: gold-100 at 30% opacity over `#FFFBF5`
- Dark mode: gold-700 at 15% opacity over `#0D0B08`

---

### Step 14 — Create 8-pointed star badge component

- [ ] **File**: `packages/ui/src/components/ui/star-badge.tsx`
- SVG 8-pointed star with number centered inside
- Props: `count: number`, `size?: number`, `className?: string`

```tsx
interface StarBadgeProps {
  count: number;
  size?: number;
  className?: string;
}

export function StarBadge({ count, size = 32, className }: StarBadgeProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}
         style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size}>
        {/* 8-pointed star (octagram) path */}
        <path
          d="M16 0l4.24 7.76L28 4l-3.76 8.24L32 16l-7.76 4.24L28 28l-8.24-3.76L16 32l-4.24-7.76L4 28l3.76-8.24L0 16l7.76-4.24L4 4l8.24 3.76z"
          className="fill-gold-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-tajawal font-bold text-sm text-dark-base dark:text-dark-base">
        {count}
      </span>
    </div>
  );
}
```

---

## Phase 2: Web App Foundation

> Configure the web app's core: font, Tailwind, providers, styles.

### Step 15 — Install web dependencies

- [ ] Run from `apps/web/`:

```bash
pnpm add @tanstack/react-query
```

> **Font**: Use `next/font/google` for Tajawal (no extra package needed — already supports Google Fonts with self-hosting).

---

### Step 16 — Update Tailwind config

- [ ] **File**: `apps/web/tailwind.config.ts`
- Use shared preset from `@repo/config/tailwind`
- Add content paths for `packages/ui` to scan shared component classes

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/config/tailwind";

const config: Config = {
  presets: [sharedConfig],
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
};

export default config;
```

---

### Step 17 — Replace Cairo with Tajawal font

- [ ] **File**: `apps/web/src/lib/fonts.ts`
- Switch from Cairo to Tajawal, include Arabic + Latin subsets

```typescript
import { Tajawal } from "next/font/google";

export const tajawal = Tajawal({
  subsets: ["latin", "arabic"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-tajawal",
});
```

---

### Step 18 — Update root layout

- [ ] **File**: `apps/web/src/app/[locale]/layout.tsx`
- Replace Cairo with Tajawal
- Add `QueryClientProvider` (via `QueryProvider` wrapper)
- Add `AuthProvider`
- Add background texture class
- Add `BottomNav` component

```tsx
import { NextIntlClientProvider, useMessages } from "next-intl";
import { tajawal } from "@/lib/fonts";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { BottomNav } from "@/components/bottom-nav";

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body className={`${tajawal.className} bg-light-base dark:bg-dark-base`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>
              <AuthProvider>
                <main className="min-h-screen pb-20 bg-texture">
                  {children}
                </main>
                <BottomNav />
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

### Step 19 — Overhaul globals.css with gold design tokens

- [ ] **File**: `apps/web/src/app/globals.css`
- Replace default Shadcn CSS variables with gold palette
- Add `bg-texture` utility for Islamic geometric background
- Add dark mode gold colors

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Gold-dominant light theme */
    --background: 40 100% 98%;        /* #FFFBF5 warm cream */
    --foreground: 24 10% 10%;         /* #1C1917 warm black */

    --card: 0 0% 100%;               /* #FFFFFF */
    --card-foreground: 24 10% 10%;

    --popover: 0 0% 100%;
    --popover-foreground: 24 10% 10%;

    --primary: 38 92% 50%;           /* #F59E0B gold-500 */
    --primary-foreground: 30 50% 3%; /* #0D0B08 dark-base */

    --secondary: 40 60% 95%;        /* #FEF8F0 light-surface */
    --secondary-foreground: 28 73% 16%; /* #451A03 gold-950 */

    --muted: 40 60% 95%;
    --muted-foreground: 28 44% 29%; /* #78350F gold-900 */

    --accent: 40 60% 95%;
    --accent-foreground: 28 73% 16%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 40 50% 88%;           /* gold-200 muted */
    --input: 40 50% 88%;
    --ring: 38 92% 50%;             /* gold-500 */

    --radius: 12px;
  }

  .dark {
    /* Gold-dominant dark theme — warm browns, not cold gray */
    --background: 30 25% 3%;          /* #0D0B08 dark-base */
    --foreground: 45 80% 78%;         /* #FDE68A gold-200 */

    --card: 32 20% 8%;               /* #1A1510 dark-card */
    --card-foreground: 45 80% 78%;

    --popover: 32 20% 8%;
    --popover-foreground: 45 80% 78%;

    --primary: 38 92% 50%;           /* #F59E0B gold-500 */
    --primary-foreground: 30 25% 3%; /* #0D0B08 dark-base */

    --secondary: 33 22% 12%;        /* #262015 dark-elevated */
    --secondary-foreground: 45 80% 78%;

    --muted: 33 22% 12%;
    --muted-foreground: 32 66% 38%; /* #B45309 gold-700 */

    --accent: 33 22% 12%;
    --accent-foreground: 45 80% 78%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 100%;

    --border: 32 66% 20%;           /* gold-800 at reduced opacity */
    --input: 32 66% 20%;
    --ring: 38 92% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground font-tajawal;
  }
}

@layer utilities {
  /* Islamic geometric background texture */
  .bg-texture {
    background-image: url("/patterns/arabesque.svg");
    background-repeat: repeat;
    background-size: 120px 120px;
  }
  :root .bg-texture {
    background-color: #fffbf5;
    background-blend-mode: soft-light;
    opacity: 1;
  }
  .dark .bg-texture {
    background-color: #0d0b08;
    background-blend-mode: soft-light;
  }

  /* Completion checkmark animation */
  @keyframes checkmark {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }
  .animate-checkmark {
    animation: checkmark 0.4s ease-out forwards;
  }

  /* Counter bounce animation */
  @keyframes count-bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.15); }
    100% { transform: scale(1); }
  }
  .animate-count-bounce {
    animation: count-bounce 0.2s ease-out;
  }
}
```

---

## Phase 3: API Client & Hooks

> Typed API client and 8 custom hooks for all data fetching and state management.

### Step 20 — Create typed API client

- [ ] **File**: `apps/web/src/lib/api-client.ts`
- Full typed client class with every NestJS endpoint
- Base URL from `NEXT_PUBLIC_API_URL` env var (defaults to `http://localhost:3001`)
- Auth header from stored JWT token

```typescript
import type {
  Zikr, CounterPreset, DailyProgress, CounterState,
  AuthTokens, UserProfile, UserPreferences,
  RegisterDto, LoginDto, ApiResponse,
} from "@repo/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const API_PREFIX = "/api/v1";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${BASE_URL}${API_PREFIX}${path}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.error?.message || error.message || "Request failed");
    }
    const json: ApiResponse<T> = await res.json();
    return json.data;
  }

  // ─── Auth ──────────────────────────────
  register(dto: RegisterDto) { return this.request<AuthTokens>("/auth/register", { method: "POST", body: JSON.stringify(dto) }); }
  login(dto: LoginDto) { return this.request<AuthTokens>("/auth/login", { method: "POST", body: JSON.stringify(dto) }); }
  refresh(refreshToken: string) { return this.request<AuthTokens>("/auth/refresh", { method: "POST", body: JSON.stringify({ refreshToken }) }); }
  googleLogin(token: string) { return this.request<AuthTokens>("/auth/google", { method: "POST", body: JSON.stringify({ provider: "google", token }) }); }
  appleLogin(code: string) { return this.request<AuthTokens>("/auth/apple", { method: "POST", body: JSON.stringify({ provider: "apple", token: code }) }); }
  getMe() { return this.request<UserProfile>("/auth/me"); }

  // ─── Azkar (public) ────────────────────
  getAzkar(category: string) { return this.request<Zikr[]>(`/azkar?category=${category}`); }
  getAllAzkar() { return this.request<Zikr[]>("/azkar/all"); }
  getAzkarVersion() { return this.request<{ version: number }>("/azkar/version"); }
  getCounterPresets() { return this.request<CounterPreset[]>("/counter-presets"); }

  // ─── Progress (protected) ──────────────
  getProgress(date: string) { return this.request<DailyProgress[]>(`/progress?date=${date}`); }
  upsertProgress(data: { date: string; category: string; completedIds: number[]; inProgress: Record<number, number> }) {
    return this.request<DailyProgress>("/progress", { method: "PUT", body: JSON.stringify(data) });
  }
  getStreak() { return this.request<{ count: number; lastDate: string | null }>("/progress/streak"); }

  // ─── Counter (protected) ───────────────
  getCounter() { return this.request<CounterState>("/counter"); }
  saveCounter(data: CounterState) { return this.request<CounterState>("/counter", { method: "PUT", body: JSON.stringify(data) }); }

  // ─── Favorites (protected) ─────────────
  getFavorites() { return this.request<{ zikrId: number }[]>("/favorites"); }
  addFavorite(zikrId: number) { return this.request<void>(`/favorites/${zikrId}`, { method: "POST" }); }
  removeFavorite(zikrId: number) { return this.request<void>(`/favorites/${zikrId}`, { method: "DELETE" }); }

  // ─── Preferences (protected) ───────────
  getPreferences() { return this.request<UserPreferences>("/preferences"); }
  updatePreferences(data: Partial<UserPreferences>) { return this.request<UserPreferences>("/preferences", { method: "PATCH", body: JSON.stringify(data) }); }
}

export const apiClient = new ApiClient();
```

---

### Step 21 — `useAuth` hook

- [ ] **File**: `apps/web/src/hooks/use-auth.ts`
- Manages JWT tokens in localStorage
- `login(email, password)`, `register(email, password, name)`, `logout()`
- Auto-refresh on mount if refresh token exists
- Exposes `user`, `isAuthenticated`, `isLoading`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { UserProfile, AuthTokens } from "@repo/types";

const ACCESS_TOKEN_KEY = "zikr_access_token";
const REFRESH_TOKEN_KEY = "zikr_refresh_token";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    apiClient.setToken(tokens.accessToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const profile = await apiClient.getMe();
      setUser(profile);
    } catch {
      clearTokens();
    }
  }, [clearTokens]);

  // Auto-restore session on mount
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (accessToken) {
        apiClient.setToken(accessToken);
        await fetchUser();
      } else if (refreshToken) {
        try {
          const tokens = await apiClient.refresh(refreshToken);
          storeTokens(tokens);
          await fetchUser();
        } catch { clearTokens(); }
      }
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await apiClient.login({ email, password });
    storeTokens(tokens);
    await fetchUser();
  };

  const register = async (email: string, password: string, name?: string) => {
    const tokens = await apiClient.register({ email, password, name });
    storeTokens(tokens);
    await fetchUser();
  };

  const logout = () => clearTokens();

  return { user, isAuthenticated: !!user, isLoading, login, register, logout };
}
```

---

### Step 22 — `useAzkar` hook

- [ ] **File**: `apps/web/src/hooks/use-azkar.ts`
- TanStack Query hook fetching azkar by category from API
- Returns `{ data: Zikr[], isLoading, error }`

```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Zikr, TimePeriod } from "@repo/types";

export function useAzkar(category: TimePeriod) {
  return useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    queryFn: () => apiClient.getAzkar(category),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
```

---

### Step 23 — `useTimePeriod` hook

- [ ] **File**: `apps/web/src/hooks/use-time-period.ts`
- Returns current `TimePeriod`, auto-updates every 60 seconds

```typescript
"use client";
import { useState, useEffect } from "react";
import { getCurrentTimePeriod } from "@repo/utils";
import type { TimePeriod } from "@repo/types";

export function useTimePeriod(): TimePeriod {
  const [period, setPeriod] = useState<TimePeriod>(getCurrentTimePeriod());

  useEffect(() => {
    const interval = setInterval(() => {
      setPeriod(getCurrentTimePeriod());
    }, 60_000); // every minute
    return () => clearInterval(interval);
  }, []);

  return period;
}
```

---

### Step 24 — `useProgress` hook

- [ ] **File**: `apps/web/src/hooks/use-progress.ts`
- localStorage for instant UX + background API sync when logged in
- `getProgress(date, category)`, `markZikrComplete(zikrId)`, `updateInProgress(zikrId, count)`, `resetCategory(category)`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { DailyProgress, CategoryProgress, TimePeriod } from "@repo/types";

const PROGRESS_KEY = "zikr_daily_progress";

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getEmptyProgress(): DailyProgress {
  const empty: CategoryProgress = { completed: [], inProgress: {} };
  return {
    date: getTodayDate(),
    morning: { ...empty },
    evening: { ...empty },
    night: { ...empty },
  };
}

export function useProgress(isAuthenticated: boolean) {
  const [progress, setProgress] = useState<DailyProgress>(getEmptyProgress());

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      const parsed: DailyProgress = JSON.parse(stored);
      // Reset if different day
      if (parsed.date !== getTodayDate()) {
        setProgress(getEmptyProgress());
      } else {
        setProgress(parsed);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  // Background API sync
  const syncToApi = useCallback(async (category: TimePeriod, catProgress: CategoryProgress) => {
    if (!isAuthenticated) return;
    try {
      await apiClient.upsertProgress({
        date: getTodayDate(),
        category,
        completedIds: catProgress.completed,
        inProgress: catProgress.inProgress,
      });
    } catch { /* silent — localStorage is source of truth */ }
  }, [isAuthenticated]);

  const markZikrComplete = (category: TimePeriod, zikrId: number) => {
    setProgress((prev) => {
      const cat = { ...prev[category] };
      if (!cat.completed.includes(zikrId)) {
        cat.completed = [...cat.completed, zikrId];
      }
      const { [zikrId]: _, ...rest } = cat.inProgress;
      cat.inProgress = rest;
      const next = { ...prev, [category]: cat };
      syncToApi(category, cat);
      return next;
    });
  };

  const updateInProgress = (category: TimePeriod, zikrId: number, count: number) => {
    setProgress((prev) => {
      const cat = { ...prev[category] };
      cat.inProgress = { ...cat.inProgress, [zikrId]: count };
      const next = { ...prev, [category]: cat };
      syncToApi(category, cat);
      return next;
    });
  };

  const resetCategory = (category: TimePeriod) => {
    const empty: CategoryProgress = { completed: [], inProgress: {} };
    setProgress((prev) => ({ ...prev, [category]: empty }));
    if (isAuthenticated) syncToApi(category, { completed: [], inProgress: {} });
  };

  return { progress, markZikrComplete, updateInProgress, resetCategory };
}
```

---

### Step 25 — `useCounter` hook

- [ ] **File**: `apps/web/src/hooks/use-counter.ts`
- localStorage + API sync for tasbih counter state
- `current`, `target`, `presetId`, `increment()`, `reset()`, `setTarget(n)`, `selectPreset(preset)`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { CounterState } from "@repo/types";

const COUNTER_KEY = "zikr_counter_state";

const DEFAULT: CounterState = { current: 0, target: 33 };

export function useCounter(isAuthenticated: boolean) {
  const [state, setState] = useState<CounterState>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(COUNTER_KEY);
    if (stored) setState(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(COUNTER_KEY, JSON.stringify(state));
  }, [state]);

  const syncToApi = useCallback(async (s: CounterState) => {
    if (!isAuthenticated) return;
    try { await apiClient.saveCounter(s); } catch {}
  }, [isAuthenticated]);

  const increment = () => {
    setState((prev) => {
      const next = { ...prev, current: prev.current + 1 };
      syncToApi(next);
      return next;
    });
  };

  const reset = () => {
    setState((prev) => {
      const next = { ...prev, current: 0 };
      syncToApi(next);
      return next;
    });
  };

  const setTarget = (target: number) => {
    setState((prev) => {
      const next = { ...prev, target, current: 0 };
      syncToApi(next);
      return next;
    });
  };

  const selectPreset = (presetId: string, target: number, customLabel?: string) => {
    setState({ current: 0, target, presetId, customLabel });
  };

  return { ...state, increment, reset, setTarget, selectPreset };
}
```

---

### Step 26 — `useFavorites` hook

- [ ] **File**: `apps/web/src/hooks/use-favorites.ts`
- localStorage + API sync for favorite zikr IDs
- `favorites: number[]`, `toggle(zikrId)`, `isFavorite(zikrId)`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

const FAVORITES_KEY = "zikr_favorites";

export function useFavorites(isAuthenticated: boolean) {
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggle = useCallback((zikrId: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(zikrId);
      const next = exists ? prev.filter((id) => id !== zikrId) : [...prev, zikrId];
      // Background API sync
      if (isAuthenticated) {
        (exists ? apiClient.removeFavorite(zikrId) : apiClient.addFavorite(zikrId)).catch(() => {});
      }
      return next;
    });
  }, [isAuthenticated]);

  const isFavorite = useCallback((zikrId: number) => favorites.includes(zikrId), [favorites]);

  return { favorites, toggle, isFavorite };
}
```

---

### Step 27 — `useStreak` hook

- [ ] **File**: `apps/web/src/hooks/use-streak.ts`
- localStorage + API sync for streak tracking
- `streak: number`, `checkAndUpdateStreak()` — called when a category is fully completed

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

const STREAK_KEY = "zikr_streak";

interface StreakState {
  count: number;
  lastDate: string | null;
}

export function useStreak(isAuthenticated: boolean) {
  const [streak, setStreak] = useState<StreakState>({ count: 0, lastDate: null });

  useEffect(() => {
    const stored = localStorage.getItem(STREAK_KEY);
    if (stored) setStreak(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streak));
  }, [streak]);

  const checkAndUpdateStreak = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    setStreak((prev) => {
      if (prev.lastDate === today) return prev; // Already counted today

      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const isConsecutive = prev.lastDate === yesterday;
      const next: StreakState = {
        count: isConsecutive ? prev.count + 1 : 1,
        lastDate: today,
      };

      if (isAuthenticated) {
        apiClient.upsertProgress({ date: today, category: "morning", completedIds: [], inProgress: {} }).catch(() => {});
      }
      return next;
    });
  }, [isAuthenticated]);

  return { streak: streak.count, lastDate: streak.lastDate, checkAndUpdateStreak };
}
```

---

### Step 28 — `usePreferences` hook

- [ ] **File**: `apps/web/src/hooks/use-preferences.ts`
- localStorage + API sync for user preferences
- `language`, `theme`, `counterMode`, `soundEnabled`, `vibrationEnabled`, `updatePreference(key, value)`

```typescript
"use client";
import { useState, useEffect, useCallback } from "react";
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

export function usePreferences(isAuthenticated: boolean) {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);

  useEffect(() => {
    const stored = localStorage.getItem(PREFS_KEY);
    if (stored) setPrefs({ ...DEFAULTS, ...JSON.parse(stored) });
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPrefs((prev) => {
        const next = { ...prev, [key]: value };
        if (isAuthenticated) {
          apiClient.updatePreferences({ [key]: value }).catch(() => {});
        }
        return next;
      });
    },
    [isAuthenticated]
  );

  return { ...prefs, updatePreference };
}
```

---

## Phase 4: Layout & Navigation Components

### Step 29 — Bottom navigation bar

- [ ] **File**: `apps/web/src/components/bottom-nav.tsx`
- 4 tabs: Home, Counter, Favorites, Settings
- Gold active indicator, fixed bottom, RTL-aware
- Arabic/English labels via next-intl

```tsx
"use client";
import { useTranslations } from "next-intl";
import { usePathname } from "@/navigation";
import { Link } from "@/navigation";
import { Home, Hash, Heart, Settings } from "lucide-react";

const tabs = [
  { key: "home",      href: "/",          icon: Home },
  { key: "counter",   href: "/counter",   icon: Hash },
  { key: "favorites", href: "/favorites", icon: Heart },
  { key: "settings",  href: "/settings",  icon: Settings },
] as const;

export function BottomNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-dark-card border-t border-gold-200 dark:border-gold-800/30 rounded-t-2xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ key, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${
                isActive
                  ? "text-gold-500"
                  : "text-gold-700 dark:text-gold-700 hover:text-gold-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(key)}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

---

### Step 30 — Auth dialog (modal)

- [ ] **File**: `apps/web/src/components/auth-dialog.tsx`
- Modal dialog for quick login/register from home page for guests
- Uses Shadcn Dialog component
- Tabs for Login / Register
- Email + password form, social login buttons

---

### Step 31 — Auth provider (React context)

- [ ] **File**: `apps/web/src/providers/auth-provider.tsx`
- Wraps `useAuth` hook in a React context
- Provides `user`, `isAuthenticated`, `isLoading`, `login`, `register`, `logout` to entire app

```tsx
"use client";
import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { UserProfile } from "@repo/types";

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}
```

---

### Step 32 — Query provider (TanStack Query)

- [ ] **File**: `apps/web/src/providers/query-provider.tsx`
- `QueryClientProvider` wrapper with default config

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,  // 5 min
            retry: 1,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

---

## Phase 5: Shared UI Components (app-specific)

### Step 33 — ZikrCard component

- [ ] **File**: `apps/web/src/components/zikr-card.tsx`
- Card showing: Arabic text (large, with tashkeel), translation, star-badge repeat count, favorite heart icon, completion state (not started / in progress / completed)
- Props: `zikr: Zikr`, `progress: { completed: boolean; currentCount?: number }`, `isFavorite: boolean`, `onToggleFavorite: () => void`, `onClick: () => void`

```tsx
"use client";
import { Card } from "@repo/ui/components";
import { StarBadge } from "@repo/ui/components";
import { Heart, Check } from "lucide-react";
import type { Zikr } from "@repo/types";

interface ZikrCardProps {
  zikr: Zikr;
  isCompleted: boolean;
  currentCount?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
  locale: "ar" | "en";
}

export function ZikrCard({
  zikr, isCompleted, currentCount, isFavorite, onToggleFavorite, onClick, locale,
}: ZikrCardProps) {
  const inProgress = currentCount !== undefined && currentCount > 0 && !isCompleted;

  return (
    <Card
      className={`relative p-5 cursor-pointer transition-all rounded-xl border
        ${isCompleted
          ? "border-gold-500/50 bg-gold-50/50 dark:bg-gold-950/20"
          : "border-gold-200 dark:border-gold-800/30 bg-white dark:bg-dark-card"
        }
        hover:shadow-[0_2px_8px_rgba(180,83,9,0.08)] dark:hover:border-gold-700/50`}
      onClick={onClick}
    >
      {/* Star badge (repeat count) */}
      <div className="absolute top-4 ltr:right-4 rtl:left-4">
        <StarBadge count={zikr.repeatCount} />
      </div>

      {/* Arabic text */}
      <p className="text-zikr-lg text-right leading-relaxed mb-3 pe-12 dark:text-gold-200">
        {zikr.arabicText}
      </p>

      {/* Translation */}
      <p className="text-sm text-muted-foreground mb-3">
        {locale === "ar" ? zikr.translation.ar : zikr.translation.en}
      </p>

      {/* Footer: reference + status + favorite */}
      <div className="flex items-center justify-between">
        <span className="text-caption text-gold-700 dark:text-gold-700">
          {zikr.reference}
        </span>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="animate-checkmark text-gold-500">
              <Check className="w-5 h-5" />
            </span>
          )}
          {inProgress && (
            <span className="text-xs text-gold-600 font-medium">
              {currentCount}/{zikr.repeatCount}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="p-1 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? "fill-gold-500 text-gold-500" : "text-gold-300 dark:text-gold-700"}`}
            />
          </button>
        </div>
      </div>
    </Card>
  );
}
```

---

### Step 34 — PeriodCard component

- [ ] **File**: `apps/web/src/components/period-card.tsx`
- Home page card for Morning/Evening/Night section
- Shows: title (Arabic/English), icon, progress "3/12", highlighted border if current period
- Props: `period: TimePeriod`, `progress: { completed: number; total: number }`, `isCurrent: boolean`, `onClick: () => void`

---

### Step 35 — ProgressHeader component

- [ ] **File**: `apps/web/src/components/progress-header.tsx`
- Progress bar with "7/12 completed" text above azkar list
- Props: `completed: number`, `total: number`
- Uses Shadcn Progress component with gold fill

---

### Step 36 — StreakBadge component

- [ ] **File**: `apps/web/src/components/streak-badge.tsx`
- Shows streak count with flame icon and "Day 5" / "اليوم ٥" text
- Props: `count: number`

```tsx
import { Flame } from "lucide-react";
import { useTranslations } from "next-intl";

export function StreakBadge({ count }: { count: number }) {
  const t = useTranslations("Streak");
  if (count === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold-100 dark:bg-gold-950/30 border border-gold-300 dark:border-gold-800/40">
      <Flame className="w-4 h-4 text-gold-500" />
      <span className="text-sm font-medium text-gold-800 dark:text-gold-300">
        {t("day", { count })}
      </span>
    </div>
  );
}
```

---

### Step 37 — ZikrCounter (interactive mode)

- [ ] **File**: `apps/web/src/components/zikr-counter.tsx`
- Circular tap counter for the zikr detail page (interactive mode)
- Gold ring progress indicator, large count number, "Tap to count" text
- Props: `current: number`, `target: number`, `onTap: () => void`

```tsx
"use client";

interface ZikrCounterProps {
  current: number;
  target: number;
  onTap: () => void;
}

export function ZikrCounter({ current, target, onTap }: ZikrCounterProps) {
  const progress = Math.min(current / target, 1);
  const circumference = 2 * Math.PI * 80; // radius = 80
  const strokeDashoffset = circumference * (1 - progress);
  const isComplete = current >= target;

  return (
    <button
      onClick={onTap}
      disabled={isComplete}
      className="relative w-48 h-48 flex items-center justify-center focus:outline-none"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle cx="100" cy="100" r="80" fill="none"
          className="stroke-gold-200 dark:stroke-dark-elevated" strokeWidth="8" />
        {/* Progress arc */}
        <circle cx="100" cy="100" r="80" fill="none"
          className="stroke-gold-500 transition-all duration-200"
          strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset} />
      </svg>
      <div className="flex flex-col items-center">
        <span className={`text-4xl font-extrabold font-tajawal ${isComplete ? "text-gold-500" : "text-foreground"} animate-count-bounce`}>
          {current}
        </span>
        <span className="text-sm text-muted-foreground">/ {target}</span>
      </div>
    </button>
  );
}
```

---

### Step 38 — CounterCircle (standalone tasbih page)

- [ ] **File**: `apps/web/src/components/counter-circle.tsx`
- Large 200px circular counter for the standalone tasbih page
- Gold stroke on dark-base background, animated increment
- Same structure as ZikrCounter but larger and with different styling for the counter page

---

## Phase 6: Pages — Home

### Step 39 — Rewrite Home page

- [ ] **File**: `apps/web/src/app/[locale]/page.tsx`
- Time-based greeting via `getGreeting(period, locale)`
- Streak badge
- 3 PeriodCards (morning/evening/night) with progress from `useProgress`
- Current period card is highlighted
- Counter quick-access card (shows current count/target)
- Login prompt for guests (AuthDialog)

```tsx
"use client";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useTimePeriod } from "@/hooks/use-time-period";
import { useProgress } from "@/hooks/use-progress";
import { useStreak } from "@/hooks/use-streak";
import { useAuthContext } from "@/providers/auth-provider";
import { getGreeting } from "@repo/utils";
import { PeriodCard } from "@/components/period-card";
import { StreakBadge } from "@/components/streak-badge";
import type { TimePeriod } from "@repo/types";

const periods: TimePeriod[] = ["morning", "evening", "night"];

export default function HomePage() {
  const t = useTranslations("Home");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const currentPeriod = useTimePeriod();
  const { isAuthenticated } = useAuthContext();
  const { progress } = useProgress(isAuthenticated);
  const { streak } = useStreak(isAuthenticated);

  const greeting = getGreeting(currentPeriod, locale);

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 space-y-6">
      {/* Greeting + Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gold-900 dark:text-gold-200">
            {greeting}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <StreakBadge count={streak} />
      </div>

      {/* Period cards */}
      <div className="grid grid-cols-1 gap-3">
        {periods.map((period) => (
          <PeriodCard
            key={period}
            period={period}
            progress={{
              completed: progress[period].completed.length,
              total: 0, // Will be set from API azkar count
            }}
            isCurrent={period === currentPeriod}
            onClick={() => router.push(`/azkar/${period}`)}
          />
        ))}
      </div>

      {/* Counter quick card */}
      <div
        className="p-5 rounded-xl border border-gold-200 dark:border-gold-800/30 bg-white dark:bg-dark-card cursor-pointer hover:shadow-[0_2px_8px_rgba(180,83,9,0.08)]"
        onClick={() => router.push("/counter")}
      >
        <h3 className="font-semibold text-gold-900 dark:text-gold-200">
          {t("counter")}
        </h3>
        <p className="text-sm text-muted-foreground">{t("counterDesc")}</p>
      </div>

      {/* Guest login prompt */}
      {!isAuthenticated && (
        <p className="text-center text-sm text-muted-foreground">
          {t("loginPrompt")}
        </p>
      )}
    </div>
  );
}
```

---

## Phase 7: Pages — Azkar

### Step 40 — Azkar category list page

- [ ] **File**: `apps/web/src/app/[locale]/azkar/[category]/page.tsx`
- Fetches azkar from API via `useAzkar(category)`
- Tab bar for switching between morning/evening/night (or route-based, since each has its own URL)
- ProgressHeader showing "7/12 completed"
- Scrollable list of ZikrCard components
- "Reset All" button at bottom with confirmation Dialog

```tsx
"use client";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useAzkar } from "@/hooks/use-azkar";
import { useProgress } from "@/hooks/use-progress";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuthContext } from "@/providers/auth-provider";
import { ZikrCard } from "@/components/zikr-card";
import { ProgressHeader } from "@/components/progress-header";
import type { TimePeriod } from "@repo/types";

export default function AzkarCategoryPage() {
  const params = useParams();
  const category = params.category as TimePeriod;
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Azkar");
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  const { data: azkar, isLoading } = useAzkar(category);
  const { progress, resetCategory } = useProgress(isAuthenticated);
  const { isFavorite, toggle: toggleFavorite } = useFavorites(isAuthenticated);

  const catProgress = progress[category];

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;
  if (!azkar) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-gold-900 dark:text-gold-200">
        {t(`title.${category}`)}
      </h1>

      <ProgressHeader completed={catProgress.completed.length} total={azkar.length} />

      <div className="space-y-3">
        {azkar.map((zikr) => (
          <ZikrCard
            key={zikr.id}
            zikr={zikr}
            isCompleted={catProgress.completed.includes(zikr.id)}
            currentCount={catProgress.inProgress[zikr.id]}
            isFavorite={isFavorite(zikr.id)}
            onToggleFavorite={() => toggleFavorite(zikr.id)}
            onClick={() => router.push(`/azkar/${category}/${zikr.id}`)}
            locale={locale}
          />
        ))}
      </div>

      <button
        onClick={() => resetCategory(category)}
        className="w-full py-3 text-sm text-gold-700 dark:text-gold-500 hover:text-gold-900 dark:hover:text-gold-300 transition-colors"
      >
        {t("resetAll")}
      </button>
    </div>
  );
}
```

---

### Step 41 — Zikr detail page (interactive + display modes)

- [ ] **File**: `apps/web/src/app/[locale]/azkar/[category]/[id]/page.tsx`
- Two modes based on `counterMode` preference:

**Interactive mode** (default):
- Full Arabic text centered (large, with tashkeel)
- Translation below
- Reference and virtue sections
- Circular tap counter (`ZikrCounter`): current/target, auto-complete on target reached
- "Next" button after complete advances to next zikr, or "Back to Home" on last zikr

**Display Only mode**:
- Full Arabic text centered
- Translation below
- "Read it X times" / "اقرأها ٣ مرات" text
- "Next" button marks complete and advances, or "Back to Home" on last zikr

**Both modes**:
- Favorite toggle (heart) in header
- Reference and virtue sections below main content

```tsx
"use client";
import { useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useAzkar } from "@/hooks/use-azkar";
import { useProgress } from "@/hooks/use-progress";
import { useFavorites } from "@/hooks/use-favorites";
import { usePreferences } from "@/hooks/use-preferences";
import { useAuthContext } from "@/providers/auth-provider";
import { ZikrCounter } from "@/components/zikr-counter";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import type { TimePeriod } from "@repo/types";

export default function ZikrDetailPage() {
  const params = useParams();
  const category = params.category as TimePeriod;
  const id = Number(params.id);
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("ZikrDetail");
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  const { data: azkar } = useAzkar(category);
  const { progress, markZikrComplete, updateInProgress } = useProgress(isAuthenticated);
  const { isFavorite, toggle: toggleFavorite } = useFavorites(isAuthenticated);
  const { counterMode } = usePreferences(isAuthenticated);

  const zikr = azkar?.find((z) => z.id === id);
  if (!zikr || !azkar) return null;

  const currentIndex = azkar.findIndex((z) => z.id === id);
  const isLast = currentIndex === azkar.length - 1;
  const nextZikr = !isLast ? azkar[currentIndex + 1] : null;

  const catProgress = progress[category];
  const isCompleted = catProgress.completed.includes(id);
  const currentCount = catProgress.inProgress[id] ?? 0;

  const handleTap = () => {
    const newCount = currentCount + 1;
    if (newCount >= zikr.repeatCount) {
      markZikrComplete(category, id);
    } else {
      updateInProgress(category, id, newCount);
    }
  };

  const handleNext = () => {
    if (!isCompleted) markZikrComplete(category, id);
    if (nextZikr) {
      router.push(`/azkar/${category}/${nextZikr.id}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
      {/* Header with back + favorite */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/azkar/${category}`)}>
          {locale === "ar" ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        </button>
        <button onClick={() => toggleFavorite(id)}>
          <Heart className={`w-6 h-6 ${isFavorite(id) ? "fill-gold-500 text-gold-500" : "text-gold-300"}`} />
        </button>
      </div>

      {/* Arabic text */}
      <p className="text-zikr-xl text-center leading-loose dark:text-gold-200">
        {zikr.arabicText}
      </p>

      {/* Translation */}
      <p className="text-center text-muted-foreground">
        {locale === "ar" ? zikr.translation.ar : zikr.translation.en}
      </p>

      {/* Counter or display mode */}
      {counterMode === "interactive" ? (
        <div className="flex justify-center py-4">
          <ZikrCounter current={currentCount} target={zikr.repeatCount} onTap={handleTap} />
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-lg text-gold-600 dark:text-gold-400 font-medium">
            {t("readTimes", { count: zikr.repeatCount })}
          </p>
        </div>
      )}

      {/* Reference */}
      {zikr.reference && (
        <p className="text-caption text-gold-700 dark:text-gold-700 text-center">
          {zikr.reference}
        </p>
      )}

      {/* Virtue */}
      {zikr.virtue && (
        <div className="p-4 rounded-xl bg-gold-50 dark:bg-dark-elevated border border-gold-200 dark:border-gold-800/30">
          <p className="text-sm text-gold-800 dark:text-gold-300">
            {locale === "ar" ? zikr.virtue.ar : zikr.virtue.en}
          </p>
        </div>
      )}

      {/* Next / Back to Home button */}
      {(isCompleted || counterMode === "display") && (
        <button
          onClick={handleNext}
          className="w-full h-12 rounded-xl bg-gold-500 text-dark-base font-semibold transition-colors hover:bg-gold-400"
        >
          {isLast ? t("backToHome") : t("next")}
        </button>
      )}
    </div>
  );
}
```

---

## Phase 8: Pages — Counter

### Step 42 — Tasbih Counter page

- [ ] **File**: `apps/web/src/app/[locale]/counter/page.tsx`
- Preset selector row: SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34), Custom
- Large `CounterCircle` component in center
- Arabic + English label of current preset
- Reset button with confirmation Dialog

```tsx
"use client";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCounter } from "@/hooks/use-counter";
import { useAuthContext } from "@/providers/auth-provider";
import { CounterCircle } from "@/components/counter-circle";

export default function CounterPage() {
  const t = useTranslations("Counter");
  const locale = useLocale() as "ar" | "en";
  const { isAuthenticated } = useAuthContext();
  const counter = useCounter(isAuthenticated);

  const { data: presets } = useQuery({
    queryKey: ["counter-presets"],
    queryFn: () => apiClient.getCounterPresets(),
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col items-center space-y-8">
      <h1 className="text-xl font-bold text-gold-900 dark:text-gold-200">
        {t("title")}
      </h1>

      {/* Preset row */}
      <div className="flex flex-wrap gap-2 justify-center">
        {presets?.map((preset) => (
          <button
            key={preset.id}
            onClick={() => counter.selectPreset(preset.id, preset.targetCount)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              counter.presetId === preset.id
                ? "bg-gold-500 text-dark-base border-gold-500"
                : "bg-white dark:bg-dark-card border-gold-200 dark:border-gold-800/30 text-gold-700"
            }`}
          >
            {locale === "ar" ? preset.label.ar : preset.label.en}
          </button>
        ))}
      </div>

      {/* Large counter */}
      <CounterCircle
        current={counter.current}
        target={counter.target}
        onTap={counter.increment}
      />

      {/* Label */}
      {counter.customLabel && (
        <p className="text-lg font-medium text-gold-800 dark:text-gold-300">
          {counter.customLabel}
        </p>
      )}

      {/* Reset */}
      <button
        onClick={counter.reset}
        className="px-6 py-2 rounded-xl border border-gold-300 dark:border-gold-800/30 text-gold-700 hover:bg-gold-50 dark:hover:bg-dark-elevated transition-colors"
      >
        {t("reset")}
      </button>
    </div>
  );
}
```

---

## Phase 9: Pages — Favorites & Settings

### Step 43 — Favorites page

- [ ] **File**: `apps/web/src/app/[locale]/favorites/page.tsx`
- List of favorited ZikrCards (fetches all azkar, filters by favorites list)
- Empty state: "No favorites yet" / "لا توجد مفضلات بعد" with heart icon
- Tap card to open detail page

---

### Step 44 — Settings page

- [ ] **File**: `apps/web/src/app/[locale]/settings/page.tsx`
- Language toggle: AR / EN (switches locale via next-intl)
- Theme: Light / Dark / System (uses next-themes `setTheme`)
- Counter Mode: Interactive / Display Only
- Sound: on/off toggle
- Vibration: on/off toggle
- Account section: Login button for guests, user info + logout for authenticated
- Reset progress: confirmation dialog, clears localStorage

---

## Phase 10: Pages — Auth

### Step 45 — Login page

- [ ] **File**: `apps/web/src/app/[locale]/auth/login/page.tsx`
- Email + password form with validation
- Social login buttons: Google, Apple
- Link to register page
- On success: redirect to home

---

### Step 46 — Register page

- [ ] **File**: `apps/web/src/app/[locale]/auth/register/page.tsx`
- Name + email + password form with validation
- Social login buttons: Google, Apple
- Link to login page
- On success: redirect to home

---

## Phase 11: i18n — Full Translations

### Step 47 — Arabic translations

- [ ] **File**: `apps/web/messages/ar.json`
- ALL Arabic translations for the entire app

```json
{
  "Index": { "title": "ذكر", "description": "أذكار وتسبيح" },
  "Nav": {
    "home": "الرئيسية",
    "counter": "العدّاد",
    "favorites": "المفضلة",
    "settings": "الإعدادات"
  },
  "Home": {
    "subtitle": "ابدأ يومك بالذكر",
    "counter": "عدّاد التسبيح",
    "counterDesc": "سبّح واحصِ",
    "loginPrompt": "سجّل دخولك لحفظ تقدمك"
  },
  "Azkar": {
    "title": { "morning": "أذكار الصباح", "evening": "أذكار المساء", "night": "أذكار النوم" },
    "loading": "جارٍ التحميل...",
    "resetAll": "إعادة تعيين الكل",
    "progress": "{completed} / {total} مكتمل"
  },
  "ZikrDetail": {
    "readTimes": "اقرأها {count} مرات",
    "next": "التالي",
    "backToHome": "العودة للرئيسية",
    "tapToCount": "انقر للعد"
  },
  "Counter": {
    "title": "عدّاد التسبيح",
    "reset": "إعادة تعيين",
    "targetReached": "أحسنت! أكملت العدد",
    "custom": "مخصص"
  },
  "Favorites": {
    "title": "المفضلة",
    "empty": "لا توجد مفضلات بعد",
    "emptyHint": "أضف أذكارك المفضلة بالنقر على ❤️"
  },
  "Settings": {
    "title": "الإعدادات",
    "language": "اللغة",
    "theme": "المظهر",
    "counterMode": "وضع العدّاد",
    "interactive": "تفاعلي",
    "display": "عرض فقط",
    "sound": "الصوت",
    "vibration": "الاهتزاز",
    "account": "الحساب",
    "login": "تسجيل الدخول",
    "logout": "تسجيل الخروج",
    "resetProgress": "إعادة تعيين التقدم",
    "resetConfirm": "هل أنت متأكد؟ سيتم حذف كل تقدمك."
  },
  "Auth": {
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "name": "الاسم",
    "orContinueWith": "أو تابع عبر",
    "google": "Google",
    "apple": "Apple",
    "noAccount": "ليس لديك حساب؟",
    "hasAccount": "لديك حساب؟",
    "signUp": "سجّل الآن",
    "signIn": "سجّل دخولك"
  },
  "Streak": {
    "day": "اليوم {count}"
  },
  "Period": {
    "morning": "الصباح",
    "evening": "المساء",
    "night": "النوم"
  },
  "Theme": { "light": "فاتح", "dark": "داكن", "system": "نظام" },
  "Errors": {
    "generic": "حدث خطأ، حاول مرة أخرى",
    "invalidCredentials": "بريد إلكتروني أو كلمة مرور غير صحيحة",
    "emailExists": "البريد الإلكتروني مسجل بالفعل"
  }
}
```

---

### Step 48 — English translations

- [ ] **File**: `apps/web/messages/en.json`
- ALL English translations matching `ar.json` keys

```json
{
  "Index": { "title": "Zikr", "description": "Azkar & Tasbih" },
  "Nav": {
    "home": "Home",
    "counter": "Counter",
    "favorites": "Favorites",
    "settings": "Settings"
  },
  "Home": {
    "subtitle": "Start your day with remembrance",
    "counter": "Tasbih Counter",
    "counterDesc": "Count your dhikr",
    "loginPrompt": "Sign in to save your progress"
  },
  "Azkar": {
    "title": { "morning": "Morning Azkar", "evening": "Evening Azkar", "night": "Night Azkar" },
    "loading": "Loading...",
    "resetAll": "Reset All",
    "progress": "{completed} / {total} completed"
  },
  "ZikrDetail": {
    "readTimes": "Read it {count} times",
    "next": "Next",
    "backToHome": "Back to Home",
    "tapToCount": "Tap to count"
  },
  "Counter": {
    "title": "Tasbih Counter",
    "reset": "Reset",
    "targetReached": "Well done! Target reached",
    "custom": "Custom"
  },
  "Favorites": {
    "title": "Favorites",
    "empty": "No favorites yet",
    "emptyHint": "Add your favorite azkar by tapping the heart icon"
  },
  "Settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "counterMode": "Counter Mode",
    "interactive": "Interactive",
    "display": "Display Only",
    "sound": "Sound",
    "vibration": "Vibration",
    "account": "Account",
    "login": "Sign In",
    "logout": "Sign Out",
    "resetProgress": "Reset Progress",
    "resetConfirm": "Are you sure? All your progress will be deleted."
  },
  "Auth": {
    "login": "Sign In",
    "register": "Create Account",
    "email": "Email",
    "password": "Password",
    "name": "Name",
    "orContinueWith": "Or continue with",
    "google": "Google",
    "apple": "Apple",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "signUp": "Sign Up",
    "signIn": "Sign In"
  },
  "Streak": {
    "day": "Day {count}"
  },
  "Period": {
    "morning": "Morning",
    "evening": "Evening",
    "night": "Night"
  },
  "Theme": { "light": "Light", "dark": "Dark", "system": "System" },
  "Errors": {
    "generic": "Something went wrong, please try again",
    "invalidCredentials": "Invalid email or password",
    "emailExists": "Email is already registered"
  }
}
```

---

## Phase 12: Polish & PWA

### Step 49 — Completion checkmark animation

- [ ] Add CSS keyframes for checkmark appear animation (already in globals.css `animate-checkmark`)
- [ ] Optionally add `framer-motion` for more complex animations (scale, fade, confetti on category complete)

---

### Step 50 — Counter increment animation

- [ ] Add number scale bounce on counter increment (already in globals.css `animate-count-bounce`)
- [ ] Add haptic-like visual feedback: brief gold flash on the counter circle stroke on tap
- [ ] Celebration animation when counter target is reached (gold sparkle burst)

---

### Step 51 — Responsive design pass

- [ ] **Mobile-first** (375px): single column, full-width cards, bottom nav visible
- [ ] **Tablet** (768px): 2-column grid for period cards and azkar list, larger counter circle
- [ ] **Desktop** (1024px): max-width container (`max-w-lg` centered), consider sidebar nav instead of bottom nav at this breakpoint
- [ ] Test all pages at each breakpoint

---

### Step 52 — Dark mode pass with gold design tokens

- [ ] Verify all components use `dark:` variants correctly
- [ ] Test: cards use `dark:bg-dark-card`, text uses `dark:text-gold-200`
- [ ] Test: borders use `dark:border-gold-800/30`
- [ ] Test: background texture opacity is correct in dark mode
- [ ] Test: star badge is visible in both modes
- [ ] Test: counter circle gold stroke contrasts with dark background

---

### Step 53 — RTL testing pass

- [ ] Test all pages in Arabic (RTL layout)
- [ ] Verify: text alignment (Arabic text is `text-right` or `text-center`)
- [ ] Verify: navigation arrows flip direction
- [ ] Verify: bottom nav icon order is correct in RTL
- [ ] Verify: card layout (star badge position, heart icon position)
- [ ] Verify: progress bar fills from right in RTL
- [ ] Verify: form inputs align correctly

---

### Step 54 — PWA manifest

- [ ] **File**: `apps/web/public/manifest.json`

```json
{
  "name": "Zikr - أذكار وتسبيح",
  "short_name": "Zikr",
  "description": "Islamic Azkar & Tasbih Counter",
  "start_url": "/ar",
  "display": "standalone",
  "background_color": "#0D0B08",
  "theme_color": "#F59E0B",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

### Step 55 — Service worker for offline caching

- [ ] Add `next-pwa` package or custom service worker
- [ ] Cache: static assets, font files, arabesque SVG pattern
- [ ] Cache: last-fetched azkar data for offline viewing
- [ ] Show offline indicator banner when no connection
- [ ] Add `<link rel="manifest" href="/manifest.json" />` to layout

---

## Verification Checklist

### Step 56 — Test all pages in both languages

- [ ] Home page renders in Arabic (RTL) and English (LTR)
- [ ] Azkar list pages load data from API and display correctly
- [ ] Zikr detail page works in both interactive and display modes
- [ ] Counter page renders with presets
- [ ] Favorites page shows bookmarked items
- [ ] Settings page allows changing all preferences
- [ ] Auth pages (login/register) work with forms

### Step 57 — Test dark mode on all pages

- [ ] Toggle theme to dark — all pages use warm gold-on-brown palette
- [ ] No cold grays visible in dark mode
- [ ] Background texture is subtle but visible
- [ ] Cards have solid dark-card background over texture

### Step 58 — Test RTL layout

- [ ] All Arabic pages flow right-to-left
- [ ] Navigation icons and labels align correctly
- [ ] Text alignment is correct (Arabic right-aligned, English left-aligned)

### Step 59 — Test auth flow

- [ ] Register with email/password — tokens saved, user shown
- [ ] Login with same credentials — works
- [ ] Logout — clears tokens, UI reverts to guest
- [ ] Refresh — auto-restores session from refresh token

### Step 60 — Test azkar completion flow

- [ ] **Interactive mode**: Tap counter increments, auto-completes at target, "Next" advances
- [ ] **Display mode**: "Next" button marks complete and advances, last zikr shows "Back to Home"
- [ ] Progress persists in localStorage across page refreshes
- [ ] Completed azkar show checkmark in list

### Step 61 — Test counter persistence

- [ ] Increment counter, close tab, reopen — counter value restored
- [ ] Switch preset — counter resets to 0 with new target
- [ ] Reset button clears counter with confirmation

### Step 62 — Test favorites persistence

- [ ] Tap heart on zikr card — appears in favorites page
- [ ] Tap again — removed from favorites
- [ ] Favorites persist across page refreshes

### Step 63 — Test PWA installability

- [ ] Open Chrome DevTools > Application > Manifest — valid manifest shown
- [ ] Install prompt appears (or manual install via browser menu)
- [ ] Installed app launches in standalone mode
- [ ] Offline: cached pages/data still accessible

---

## Dependencies Summary

### To install in `apps/web/`:

```bash
pnpm add @tanstack/react-query
```

### Already present (verify):

- `next` ^14.1
- `next-intl` ^3.9
- `next-themes`
- `tailwindcss`
- `lucide-react` (icons)
- `@repo/ui`, `@repo/types`, `@repo/utils`, `@repo/config`

### Optional (Phase 12):

```bash
pnpm add next-pwa        # PWA support
pnpm add framer-motion   # Advanced animations
```

---

## Complete File List

```
packages/
  config/tailwind/
    design-tokens.js                    [NEW] Gold color scale, radius, fonts, sizes
    tailwind.preset.js                  [NEW] Tailwind preset extending tokens
    index.js                            [MODIFY] Re-export preset

  types/src/
    zikr.ts                             [NEW] Zikr, CounterPreset, Progress types
    auth.ts                             [NEW] Auth DTOs, tokens, profile
    preferences.ts                      [NEW] UserPreferences type
    api.ts                              [NEW] ApiResponse, VersionedContent
    index.ts                            [MODIFY] Re-export all

  data/                                 [NEW PACKAGE]
    src/azkar/morning.json              ~15 morning azkar with tashkeel
    src/azkar/evening.json              ~15 evening azkar with tashkeel
    src/azkar/night.json                ~10 night azkar with tashkeel
    src/counter/presets.json            Counter presets
    src/version.ts                      DATA_VERSION = 1
    src/index.ts                        Re-exports
    package.json                        @repo/data

  utils/src/
    time.ts                             [NEW] getCurrentTimePeriod, getGreeting
    version.ts                          [NEW] shouldUpdate helper
    index.ts                            [MODIFY] Re-export

  ui/src/
    assets/patterns/arabesque.svg       [NEW] Islamic geometric background tile
    components/ui/
      card.tsx                          [NEW] Shadcn Card
      badge.tsx                         [NEW] Shadcn Badge
      progress.tsx                      [NEW] Shadcn Progress
      tabs.tsx                          [NEW] Shadcn Tabs
      dialog.tsx                        [NEW] Shadcn Dialog
      sheet.tsx                         [NEW] Shadcn Sheet
      toggle.tsx                        [NEW] Shadcn Toggle
      scroll-area.tsx                   [NEW] Shadcn ScrollArea
      separator.tsx                     [NEW] Shadcn Separator
      avatar.tsx                        [NEW] Shadcn Avatar
      input.tsx                         [NEW] Shadcn Input
      label.tsx                         [NEW] Shadcn Label
      star-badge.tsx                    [NEW] 8-pointed star repeat badge

apps/web/
  tailwind.config.ts                    [MODIFY] Shared preset + content paths
  src/
    lib/
      fonts.ts                          [MODIFY] Cairo → Tajawal
      api-client.ts                     [NEW] Typed ApiClient class (all endpoints)
    hooks/
      use-auth.ts                       [NEW] JWT auth with localStorage
      use-azkar.ts                      [NEW] react-query azkar fetching
      use-time-period.ts                [NEW] Auto-updating time period
      use-progress.ts                   [NEW] localStorage + API sync progress
      use-counter.ts                    [NEW] localStorage + API sync counter
      use-favorites.ts                  [NEW] localStorage + API sync favorites
      use-streak.ts                     [NEW] localStorage + API sync streak
      use-preferences.ts                [NEW] localStorage + API sync preferences
    providers/
      auth-provider.tsx                 [NEW] React context for auth
      query-provider.tsx                [NEW] TanStack Query provider
    components/
      bottom-nav.tsx                    [NEW] 4-tab bottom navigation
      auth-dialog.tsx                   [NEW] Login/register modal dialog
      zikr-card.tsx                     [NEW] Azkar list item card
      period-card.tsx                   [NEW] Home page period card
      progress-header.tsx               [NEW] Category progress bar
      streak-badge.tsx                  [NEW] Streak display with flame
      zikr-counter.tsx                  [NEW] Circular tap counter (detail)
      counter-circle.tsx                [NEW] Large counter (tasbih page)
    app/
      globals.css                       [MODIFY] Gold CSS vars, texture, animations
      [locale]/
        layout.tsx                      [MODIFY] Tajawal, providers, bottom nav
        page.tsx                        [MODIFY] Home page (greeting, periods, streak)
        azkar/
          [category]/
            page.tsx                    [NEW] Azkar list page
            [id]/
              page.tsx                  [NEW] Zikr detail (interactive + display)
        counter/
          page.tsx                      [NEW] Tasbih counter page
        favorites/
          page.tsx                      [NEW] Favorites page
        settings/
          page.tsx                      [NEW] Settings page
        auth/
          login/
            page.tsx                    [NEW] Login page
          register/
            page.tsx                    [NEW] Register page
  messages/
    ar.json                             [MODIFY] Full Arabic translations
    en.json                             [MODIFY] Full English translations
  public/
    manifest.json                       [NEW] PWA manifest
    patterns/
      arabesque.svg                     [NEW] Copy of pattern for public serving
    icons/
      icon-192.png                      [NEW] PWA icon
      icon-512.png                      [NEW] PWA icon
```

**Total new/modified files: ~55** (shared packages ~20, web app ~35)

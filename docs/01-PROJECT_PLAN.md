# Zikr App - Project Plan

## Overview

A clean Islamic Zikr app -- the **seed of a multi-app Islamic platform** (Noor Islamic Platform). Morning/evening/night azkar, tasbih counter, time-based auto-detection, completion tracking, and user accounts. NestJS backend with **Clean Architecture + CQRS**, Next.js web (fetches from API), Expo mobile (offline-first with sync). Shared Tailwind (NativeWind). Designed to scale into Quran, Hadith, Prayer Times, and Dua apps sharing the same backend.

## Documentation Index

- **This file** (`01-PROJECT_PLAN.md`) -- High-level overview and feature scope
- **Implementation Plan** (`02-IMPLEMENTATION_PLAN.md`) -- Full technical plan with architecture, code samples, file structure, and phase breakdown
- **API Implementation** (`03-API_IMPLEMENTATION.md`) -- Step-by-step NestJS API build plan (10 phases, 74 steps, ~103 files, 6 Clean Arch modules)
- **Web Implementation** (`04-WEB_IMPLEMENTATION.md`) -- Step-by-step Next.js web app build plan (12 phases, 63 steps, ~55 files, 8 pages)
- **Mobile Implementation** (`05-MOBILE_IMPLEMENTATION.md`) -- Step-by-step Expo mobile app build plan (9 phases, 57 steps, ~45 files, offline-first)
- **Design Assets** -- `assets/design-identity-gold-v2.png`, `assets/design-components-v2.png`

---

## Current State

### What Exists (Ready)
- Monorepo structure: Turborepo + pnpm workspaces
- Next.js 14 web app with i18n (AR/EN), RTL, dark/light theme, Cairo font
- Expo/React Native mobile app (skeleton)
- NestJS API (skeleton with Hello World endpoint)
- Strapi CMS (configured, no custom content types)
- Shared packages: UI (Button), types, utils, config
- Tailwind CSS + Shadcn/ui component system

### What Needs to Be Built
- All zikr features (counter, azkar lists, completion, time detection)
- CMS content types for zikr data
- API endpoints for serving zikr data
- Web app pages and components
- Shared UI components (Card, Progress, Badge, Dialog, etc.)
- Local state management for user progress
- Mobile app (Phase 2)

---

## Architecture

```
User (Browser/Phone)
    |
    v
[Next.js Web App]  or  [Expo Mobile App]
    |                        |
    v                        v
[Shared UI + Types + Utils packages]
    |
    v
[NestJS API] <--- (optional proxy/aggregation layer)
    |
    v
[Strapi CMS] --- REST API ---> Content (Azkar, Categories, Duas)
```

### Data Strategy: Hybrid (Hardcoded + CMS)

- **Hardcoded JSON**: Ship with a complete set of authentic azkar data baked into the app. Works fully offline. Located in `packages/data/`.
- **Strapi CMS**: Used to manage and update azkar content over time (add new duas, fix text, etc.). CMS updates override local defaults when online.
- **Local Storage**: User progress (completed zikrs, counter state, streaks) stored in browser `localStorage` / AsyncStorage (mobile).

---

## Feature Specification

### Feature 1: Time-Based Home Screen

**What**: The home screen auto-detects the current time and shows the appropriate azkar section.

**Time Periods**:
| Period       | Time Range          | Default Section Shown  |
|-------------|--------------------|-----------------------|
| Morning     | Fajr - 12:00 PM    | Morning Azkar         |
| Afternoon   | 12:00 PM - Asr     | Evening Azkar         |
| Evening     | Asr - Maghrib       | Evening Azkar         |
| Night       | Maghrib - Fajr      | Night/Sleep Azkar     |

**Behavior**:
- On app load, detect current time and highlight the appropriate azkar section
- User can always switch manually between Morning / Evening / Night tabs
- Show a gentle prompt: "It's morning time -- start your morning azkar?" (Arabic/English)
- Display completion status for each period (e.g., "3/12 completed")

---

### Feature 2: Azkar Lists (Morning / Evening / Night)

**What**: Three separate lists of azkar, each containing authentic Islamic remembrances with:
- Arabic text (primary, large font)
- Translation (English, smaller font below)
- Repeat count (how many times to recite, e.g., "3x" or "7x")
- Source/reference (e.g., "Sahih Muslim", "Quran 2:255")
- Virtue/benefit (fadl) of the zikr

**Data per Zikr item**:
```
{
  id: number
  category: "morning" | "evening" | "night"
  arabicText: string          // The zikr in Arabic
  translation: string         // English translation
  transliteration?: string    // Optional romanized pronunciation
  repeatCount: number         // How many times to repeat (1, 3, 7, 10, 33, 100...)
  reference: string           // Hadith/Quran reference
  virtue?: string             // Benefit/reward of this zikr
  audioUrl?: string           // Optional audio file (future)
  order: number               // Display order within category
}
```

**Behavior**:
- Show zikr list for selected category (morning/evening/night)
- Each zikr card shows Arabic text prominently, translation below
- Tap/click a zikr card to open it in a focused view
- In focused view: show repeat count with a mini-counter
- User taps to count each repetition; card auto-completes when target reached
- Completed zikrs show a checkmark and move to "completed" state
- Progress bar at top: "7/12 azkar completed"
- "Reset All" button to start fresh

---

### Feature 3: Tasbih Counter

**What**: A simple, beautiful digital counter for free-form zikr counting.

**Behavior**:
- Large circular counter display in the center
- Tap anywhere on the counter area to increment (+1)
- Shows current count (large number)
- Target count selector: 33, 100, 1000, or custom
- Vibration feedback on tap (mobile)
- Sound option (subtle click, can be toggled off)
- When target reached: subtle celebration animation + vibration
- Reset button (with confirmation)
- Counter presets:
  - SubhanAllah (33)
  - Alhamdulillah (33)
  - Allahu Akbar (34)
  - La ilaha illallah (100)
  - Custom zikr + custom count

**State**: Saved in localStorage so user can resume if they close the app.

---

### Feature 4: Completion Tracking

**What**: Track which azkar the user has completed today.

**Behavior**:
- Each zikr card has a completion state (not started / in progress / completed)
- "In progress" means user started counting but hasn't reached the target
- "Completed" means user finished all repetitions
- Daily reset: completion state resets at Fajr time (new Islamic day)
- Summary view: "You completed 10/12 morning azkar today"
- Optional: Show a completion streak ("5 days in a row")

**State stored in localStorage**:
```
{
  date: "2026-02-11",
  morning: { completed: [1,2,3,5], inProgress: { 4: 2 } },
  evening: { completed: [], inProgress: {} },
  night:   { completed: [], inProgress: {} },
  counter: { current: 45, target: 100, label: "SubhanAllah" }
}
```

---

### Feature 5: Daily Streak & Progress

**What**: Motivate the user with a daily streak counter.

**Behavior**:
- Track consecutive days where user completed at least 1 full azkar session (morning OR evening OR night)
- Show streak count on home screen: "Day 5" with a small flame/star icon
- Show a weekly calendar view (7 dots) indicating which days had activity
- Streak resets if a full day is missed

---

### Feature 6: Favorites

**What**: Let users bookmark specific azkar/duas they want quick access to.

**Behavior**:
- Heart/bookmark icon on each zikr card
- "Favorites" section accessible from home screen
- Favorites persist across sessions (localStorage)

---

## Pages & Navigation (Web App)

```
/[locale]/                      --> Home (time-based azkar + quick actions)
/[locale]/azkar/morning         --> Morning Azkar list
/[locale]/azkar/evening         --> Evening Azkar list
/[locale]/azkar/night           --> Night/Sleep Azkar list
/[locale]/azkar/[id]            --> Single zikr detail/counter view
/[locale]/counter               --> Tasbih counter page
/[locale]/favorites             --> Saved/bookmarked azkar
/[locale]/settings              --> Language, theme, notifications
```

### Navigation Layout:
- **Bottom tab bar** (mobile-style, even on web for simplicity):
  - Home (auto-detected azkar)
  - Counter (tasbih)
  - Favorites (bookmarked)
  - Settings

---

## UI/UX Design Principles

1. **Arabic-first**: Arabic text is always the largest, most prominent element
2. **Clean & calm**: Soft colors, generous whitespace, no clutter
3. **Islamic aesthetic**: Subtle geometric patterns, warm gold/green accent colors
4. **Dark mode friendly**: Easy on the eyes for night azkar
5. **One-handed use**: All primary actions reachable with thumb (important for counter)
6. **RTL-native**: Full RTL support for Arabic, LTR for English
7. **Accessible**: Large tap targets, good contrast, screen reader support

### Color Palette:
- **Light mode**: White background, dark text, emerald/teal accents (#059669), gold highlights (#D97706)
- **Dark mode**: Dark gray background (#1a1a2e), light text, emerald accents (#34D399), warm gold (#FBBF24)

### Typography:
- Arabic: Cairo font (already configured), large sizes (24-32px for zikr text)
- English: Cairo font, smaller sizes (14-16px for translations)

---

## Data Model (Strapi CMS Content Types)

### Content Type: `Zikr` (Collection Type)

| Field            | Type          | Required | Notes                           |
|-----------------|---------------|----------|---------------------------------|
| arabicText      | Rich Text     | Yes      | The zikr in Arabic              |
| translation_en  | Rich Text     | No       | English translation             |
| translation_ar  | Rich Text     | No       | Arabic explanation/tafsir       |
| transliteration | Text          | No       | Romanized pronunciation         |
| repeatCount     | Integer       | Yes      | Default: 1                      |
| reference       | Text          | No       | Hadith/Quran reference          |
| virtue_ar       | Text          | No       | Benefit in Arabic               |
| virtue_en       | Text          | No       | Benefit in English              |
| category        | Enumeration   | Yes      | morning, evening, night, general|
| order           | Integer       | Yes      | Display order in category       |
| audio           | Media         | No       | Audio recitation file           |

### Content Type: `CounterPreset` (Collection Type)

| Field        | Type     | Required | Notes                  |
|-------------|----------|----------|------------------------|
| label_ar    | Text     | Yes      | Arabic name            |
| label_en    | Text     | Yes      | English name           |
| targetCount | Integer  | Yes      | Default target (33, 100, etc.) |
| order       | Integer  | Yes      | Display order          |

### Content Type: `AppSettings` (Single Type)

| Field              | Type    | Required | Notes                          |
|-------------------|---------|----------|--------------------------------|
| morningStartHour  | Integer | Yes      | Default: 5 (Fajr approx)      |
| morningEndHour    | Integer | Yes      | Default: 12                    |
| eveningStartHour  | Integer | Yes      | Default: 15 (Asr approx)      |
| nightStartHour    | Integer | Yes      | Default: 18 (Maghrib approx)  |
| dailyResetHour    | Integer | Yes      | Default: 5 (Fajr time)        |

---

## Shared Data Package: `packages/data`

Since zikr data should work offline, we ship a hardcoded dataset:

```
packages/data/
  src/
    azkar/
      morning.ts        --> Array of morning azkar objects
      evening.ts        --> Array of evening azkar objects
      night.ts          --> Array of night azkar objects
    counter/
      presets.ts        --> Counter preset configurations
    types.ts            --> Shared Zikr, CounterPreset interfaces
    index.ts            --> Re-exports everything
  package.json
  tsconfig.json
```

This package is imported by both web and mobile apps. If CMS data is available (online), it overrides the defaults.

---

## Shared Types: `packages/types`

```typescript
// Zikr types
interface Zikr {
  id: number;
  arabicText: string;
  translation: { ar?: string; en?: string };
  transliteration?: string;
  repeatCount: number;
  reference?: string;
  virtue?: { ar?: string; en?: string };
  category: 'morning' | 'evening' | 'night' | 'general';
  order: number;
  audioUrl?: string;
}

interface CounterPreset {
  id: string;
  label: { ar: string; en: string };
  targetCount: number;
  order: number;
}

interface DailyProgress {
  date: string; // ISO date
  morning: CategoryProgress;
  evening: CategoryProgress;
  night: CategoryProgress;
}

interface CategoryProgress {
  completed: number[];        // Array of completed zikr IDs
  inProgress: Record<number, number>; // zikrId -> current count
}

interface CounterState {
  current: number;
  target: number;
  presetId?: string;
  customLabel?: string;
}

interface UserPreferences {
  language: 'ar' | 'en';
  theme: 'light' | 'dark' | 'system';
  favorites: number[];         // Array of favorite zikr IDs
  streak: { count: number; lastDate: string };
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

type TimePeriod = 'morning' | 'evening' | 'night';
```

---

## Shared UI Components Needed: `packages/ui`

New components to add to the existing Shadcn/ui setup:

| Component       | Purpose                                      |
|----------------|----------------------------------------------|
| Card           | Zikr card, counter card, stat card           |
| Badge          | Category tags, completion status             |
| Progress       | Completion progress bar                      |
| Tabs           | Morning/Evening/Night tab switcher           |
| Dialog         | Confirmation dialogs, zikr detail view       |
| Sheet          | Bottom sheet for settings/options             |
| Toggle         | Sound on/off, vibration on/off               |
| Separator      | Visual dividers between sections             |
| ScrollArea     | Scrollable azkar lists                       |

These are all standard Shadcn/ui components that can be added via the CLI.

---

## Implementation Plan

### Phase 1: Foundation & Data (Days 1-2)

| # | Task | Files | Status |
|---|------|-------|--------|
| 1.1 | Create `packages/data` with hardcoded azkar (morning/evening/night) | `packages/data/src/**` | Not started |
| 1.2 | Define shared TypeScript types for Zikr, Progress, Counter | `packages/types/src/zikr.ts` | Not started |
| 1.3 | Add Shadcn/ui components (Card, Badge, Progress, Tabs, Dialog, Sheet, Toggle, ScrollArea) | `packages/ui/src/components/ui/**` | Not started |
| 1.4 | Create Strapi content types (Zikr, CounterPreset, AppSettings) | `apps/cms/src/api/**` | Not started |
| 1.5 | Seed Strapi with initial azkar data | `apps/cms/database/seeds/**` | Not started |
| 1.6 | Update i18n messages (AR + EN) for all new UI strings | `apps/web/messages/**` | Not started |

### Phase 2: Core Web App - Home & Azkar (Days 3-5)

| # | Task | Files | Status |
|---|------|-------|--------|
| 2.1 | Build time-detection utility (determine current period) | `packages/utils/src/time.ts` | Not started |
| 2.2 | Build localStorage hooks (useProgress, useCounter, usePreferences) | `apps/web/src/hooks/**` | Not started |
| 2.3 | Build Home page with time-based azkar display + quick actions | `apps/web/src/app/[locale]/page.tsx` | Not started |
| 2.4 | Build bottom navigation bar component | `apps/web/src/components/navigation.tsx` | Not started |
| 2.5 | Build Azkar list page (Morning/Evening/Night tabs) | `apps/web/src/app/[locale]/azkar/[category]/page.tsx` | Not started |
| 2.6 | Build individual Zikr card component (Arabic text, translation, count) | `apps/web/src/components/zikr-card.tsx` | Not started |
| 2.7 | Build Zikr detail/counter view (focused single-zikr counting) | `apps/web/src/app/[locale]/azkar/[category]/[id]/page.tsx` | Not started |
| 2.8 | Implement completion tracking (mark zikr done, progress bar) | `apps/web/src/hooks/use-progress.ts` | Not started |

### Phase 3: Counter & Extras (Days 6-7)

| # | Task | Files | Status |
|---|------|-------|--------|
| 3.1 | Build Tasbih Counter page (large counter, presets, reset) | `apps/web/src/app/[locale]/counter/page.tsx` | Not started |
| 3.2 | Build counter component (circular display, tap to count) | `apps/web/src/components/counter-circle.tsx` | Not started |
| 3.3 | Build Favorites page and bookmark functionality | `apps/web/src/app/[locale]/favorites/page.tsx` | Not started |
| 3.4 | Build Settings page (language, theme, sound, reset data) | `apps/web/src/app/[locale]/settings/page.tsx` | Not started |
| 3.5 | Implement daily streak tracking | `apps/web/src/hooks/use-streak.ts` | Not started |
| 3.6 | Add streak display to home page | `apps/web/src/components/streak-badge.tsx` | Not started |

### Phase 4: Polish & Integration (Days 8-9)

| # | Task | Files | Status |
|---|------|-------|--------|
| 4.1 | Build NestJS API endpoints for fetching azkar from Strapi | `apps/api/src/azkar/**` | Not started |
| 4.2 | Add CMS data fetching with fallback to hardcoded data | `apps/web/src/lib/azkar-data.ts` | Not started |
| 4.3 | Add subtle animations (completion checkmark, counter increment) | Various components | Not started |
| 4.4 | Responsive design pass (mobile-first, tablet, desktop) | Various CSS | Not started |
| 4.5 | RTL testing and fixes for all pages | Various components | Not started |
| 4.6 | Dark mode styling pass for all components | Various CSS | Not started |
| 4.7 | Add PWA support (offline, installable, app icon) | `apps/web/public/manifest.json` | Not started |

### Phase 5: Mobile App (Future - Days 10-14)

| # | Task | Files | Status |
|---|------|-------|--------|
| 5.1 | Set up Expo navigation (React Navigation tabs) | `apps/mobile/src/navigation/**` | Not started |
| 5.2 | Port home screen to React Native | `apps/mobile/src/screens/**` | Not started |
| 5.3 | Port azkar list and detail screens | `apps/mobile/src/screens/**` | Not started |
| 5.4 | Port counter screen with haptic feedback | `apps/mobile/src/screens/**` | Not started |
| 5.5 | Add push notifications for azkar reminders | `apps/mobile/src/services/**` | Not started |
| 5.6 | AsyncStorage for mobile state persistence | `apps/mobile/src/hooks/**` | Not started |

---

## Page-by-Page UI Specification

### Home Page (`/[locale]/`)

```
+------------------------------------------+
|  [Language Toggle]    [Theme Toggle]      |
|                                           |
|       Bismillah / App Logo                |
|                                           |
|  +------------------------------------+   |
|  |  Good Morning / مساء الخير          |   |
|  |  "Start your morning azkar"        |   |
|  |  Day 5 streak                      |   |
|  +------------------------------------+   |
|                                           |
|  +------------+ +------------+            |
|  | Morning    | | Evening    |            |
|  | 3/12 Done  | | 0/10 Done  |            |
|  | [Start ->] | | [Start ->] |            |
|  +------------+ +------------+            |
|                                           |
|  +------------+ +------------+            |
|  | Night      | | Counter    |            |
|  | Not started| | SubhanAllah|            |
|  | [Start ->] | | 45/100     |            |
|  +------------+ +------------+            |
|                                           |
|  +----- Bottom Nav Bar ------+            |
|  | Home | Counter | Fav | Settings |      |
|  +----------------------------+           |
+------------------------------------------+
```

**Highlighted section**: The card matching current time period is visually highlighted (emerald border/glow).

### Azkar List Page (`/[locale]/azkar/morning`)

```
+------------------------------------------+
|  [<- Back]   Morning Azkar   [Filter]     |
|                                           |
|  Progress: ████████░░░░ 7/12             |
|                                           |
|  +------------------------------------+   |
|  | بسم الله الرحمن الرحيم              |   |
|  | In the name of Allah...             |   |
|  | 1x  |  Quran 1:1  |  [Heart]       |   |
|  | [Completed checkmark]               |   |
|  +------------------------------------+   |
|                                           |
|  +------------------------------------+   |
|  | أصبحنا وأصبح الملك لله              |   |
|  | We have entered the morning...      |   |
|  | 1x  |  Muslim  |  [Heart]          |   |
|  | [Tap to start]                      |   |
|  +------------------------------------+   |
|                                           |
|  +------------------------------------+   |
|  | سبحان الله وبحمده                   |   |
|  | Glory be to Allah and praise Him    |   |
|  | 100x  |  Muslim  |  [Heart]        |   |
|  | [45/100 in progress]               |   |
|  +------------------------------------+   |
|  ...                                      |
|                                           |
|  [Reset All]                              |
+------------------------------------------+
```

### Zikr Detail / Counting View

```
+------------------------------------------+
|  [<- Back]                    [Heart]     |
|                                           |
|                                           |
|       أصبحنا وأصبح الملك لله              |
|       والحمد لله لا إله إلا الله          |
|       وحده لا شريك له                     |
|                                           |
|  We have entered the morning and          |
|  at this very time all sovereignty        |
|  belongs to Allah...                      |
|                                           |
|  Reference: Sahih Muslim 2723             |
|                                           |
|  +------------------------------------+   |
|  |                                    |   |
|  |          [ 2 / 3 ]                |   |
|  |                                    |   |
|  |     Tap anywhere to count          |   |
|  |                                    |   |
|  +------------------------------------+   |
|                                           |
|  Virtue: Whoever says this in the         |
|  morning and evening...                   |
|                                           |
|  [Reset]              [Mark Complete]     |
+------------------------------------------+
```

### Tasbih Counter Page (`/[locale]/counter`)

```
+------------------------------------------+
|  [<- Back]     Counter      [Settings]    |
|                                           |
|  Presets:                                 |
|  [SubhanAllah] [Alhamdulillah]            |
|  [Allahu Akbar] [Custom...]              |
|                                           |
|       +------------------------+          |
|       |                        |          |
|       |                        |          |
|       |        [ 45 ]          |          |
|       |       / 100            |          |
|       |                        |          |
|       |  (tap to count)        |          |
|       |                        |          |
|       +------------------------+          |
|                                           |
|  SubhanAllah - سبحان الله                 |
|                                           |
|  [Reset]                                  |
+------------------------------------------+
```

---

## Authentic Azkar Data Source

The app will ship with authentic azkar from the Sunnah. Primary sources:

### Morning Azkar (adhkar al-sabah) -- ~15 items:
1. Ayat al-Kursi (Quran 2:255) - 1x
2. Surah Al-Ikhlas (Quran 112) - 3x
3. Surah Al-Falaq (Quran 113) - 3x
4. Surah An-Nas (Quran 114) - 3x
5. "Asbahna wa asbahal mulku lillah..." - 1x
6. "Allahumma bika asbahna wa bika amsayna..." - 1x
7. "Allahumma inni asbahtu ush-hiduka..." - 4x
8. "Allahumma ma asbaha bi min ni'mah..." - 1x
9. "Allahumma 'afini fi badani..." - 3x
10. "Ya Hayyu Ya Qayyum bi-rahmatika astaghith..." - 3x
11. "SubhanAllahi wa bihamdihi" - 100x
12. "La ilaha illallahu wahdahu la sharika lahu..." - 10x (or 100x)
13. "SubhanAllahi wa bihamdihi, SubhanAllahil Azim" - 100x
14. "Astaghfirullah wa atubu ilayh" - 100x
15. Salawat upon the Prophet - 10x

### Evening Azkar (adhkar al-masa) -- ~15 items:
(Similar structure, with evening-specific wording where applicable)

### Night/Sleep Azkar (adhkar al-nawm) -- ~10 items:
1. Ayat al-Kursi - 1x
2. Last two verses of Surah Al-Baqarah - 1x
3. Surah Al-Mulk (Quran 67) - 1x
4. Surah Al-Ikhlas, Al-Falaq, An-Nas - 3x each
5. "Bismika Allahumma amutu wa ahya" - 1x
6. "Allahumma qini 'adhabaka yawma tab'athu 'ibadak" - 3x
7. "SubhanAllah (33), Alhamdulillah (33), Allahu Akbar (34)" - 1 set
8. "Allahumma bismika amutu wa ahya" - 1x
9. Wiping over body with hands while reciting Al-Ikhlas, Al-Falaq, An-Nas - 3x
10. "Allahumma aslamtu nafsi ilayk..." - 1x

---

## Technical Decisions

### State Management
- **No external state library** (like Redux/Zustand) needed for V1
- Use React `useState` + `useEffect` + custom hooks
- Persist to `localStorage` via custom `useLocalStorage` hook
- Keep it simple: state lives in components, shared via hooks

### Data Fetching
- Static data from `packages/data` for immediate rendering (no loading state)
- Optional: fetch fresh data from Strapi on page load, merge with defaults
- Use Next.js server components where possible for initial data

### Routing
- Next.js App Router with `[locale]` dynamic segment (already set up)
- Add route groups for azkar pages

### PWA (Progressive Web App)
- Add `manifest.json` for installability
- Add service worker for offline caching
- This makes the web app feel like a native app on mobile devices

---

## File Structure (New/Modified Files)

```
packages/
  data/                          [NEW] Hardcoded azkar data package
    src/
      azkar/morning.ts
      azkar/evening.ts
      azkar/night.ts
      counter/presets.ts
      index.ts
    package.json
    tsconfig.json

  types/
    src/
      zikr.ts                   [NEW] Zikr-specific types
      index.ts                  [MODIFY] Re-export zikr types

  ui/
    src/components/ui/
      card.tsx                  [NEW] Shadcn Card component
      badge.tsx                 [NEW] Shadcn Badge component
      progress.tsx              [NEW] Shadcn Progress component
      tabs.tsx                  [NEW] Shadcn Tabs component
      dialog.tsx                [NEW] Shadcn Dialog component
      sheet.tsx                 [NEW] Shadcn Sheet component
      toggle.tsx                [NEW] Shadcn Toggle component
      scroll-area.tsx           [NEW] Shadcn ScrollArea component
      separator.tsx             [NEW] Shadcn Separator component

  utils/
    src/
      time.ts                  [NEW] Time period detection utility
      index.ts                 [MODIFY] Re-export time utils

apps/
  web/
    src/
      app/[locale]/
        page.tsx               [MODIFY] Home page with time-based azkar
        layout.tsx             [MODIFY] Add bottom nav, global providers
        azkar/
          [category]/
            page.tsx           [NEW] Azkar list page (morning/evening/night)
            [id]/
              page.tsx         [NEW] Single zikr detail + counter view
        counter/
          page.tsx             [NEW] Tasbih counter page
        favorites/
          page.tsx             [NEW] Favorites page
        settings/
          page.tsx             [NEW] Settings page
      components/
        bottom-nav.tsx         [NEW] Bottom navigation bar
        zikr-card.tsx          [NEW] Zikr list item card
        counter-circle.tsx     [NEW] Circular counter component
        streak-badge.tsx       [NEW] Streak display component
        period-card.tsx        [NEW] Time period section card (home)
        progress-header.tsx    [NEW] Category progress bar header
        zikr-counter.tsx       [NEW] Mini counter within zikr detail
      hooks/
        use-local-storage.ts   [NEW] Generic localStorage hook
        use-progress.ts        [NEW] Azkar completion progress hook
        use-counter.ts         [NEW] Tasbih counter state hook
        use-preferences.ts     [NEW] User preferences hook
        use-streak.ts          [NEW] Daily streak tracking hook
        use-favorites.ts       [NEW] Favorites management hook
        use-time-period.ts     [NEW] Current time period detection hook
      lib/
        azkar-data.ts          [NEW] Data fetching (local + CMS fallback)
    messages/
      ar.json                  [MODIFY] Add all Arabic translations
      en.json                  [MODIFY] Add all English translations
    public/
      manifest.json            [NEW] PWA manifest

  cms/
    src/api/
      zikr/                    [NEW] Zikr content type
      counter-preset/          [NEW] Counter preset content type
      app-setting/             [NEW] App settings single type

  api/
    src/
      azkar/                   [NEW] Azkar module (NestJS)
        azkar.module.ts
        azkar.controller.ts
        azkar.service.ts
```

---

## Implementation Order (Recommended)

The order is designed so you can see results quickly and iterate:

1. **Types & Data first** -- Define types, create hardcoded azkar data
2. **UI Components** -- Add Shadcn components to shared package
3. **Home page** -- Build the entry point with time detection
4. **Azkar list** -- Build the core feature (list + cards)
5. **Zikr detail + counting** -- Build the counting/completion flow
6. **Counter page** -- Build the standalone tasbih counter
7. **Progress & Streaks** -- Add localStorage persistence and tracking
8. **Favorites & Settings** -- Secondary features
9. **CMS + API** -- Wire up Strapi for content management
10. **Polish** -- Animations, responsive, dark mode, PWA

---

## Notes

- All zikr texts will be verified against authentic hadith sources (Sahih Bukhari, Sahih Muslim, etc.)
- The app is designed to work 100% offline with hardcoded data
- CMS is optional enhancement for content updates without deployment
- Phase 1 (web) targets ~9 working days; Phase 2 (mobile) adds ~5 more days
- No user accounts or authentication needed for V1 (localStorage only)
- The NestJS API layer is optional for V1; web app can fetch directly from Strapi or use only local data

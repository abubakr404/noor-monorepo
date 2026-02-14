"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useTimePeriod } from "@/hooks/use-time-period";
import { useProgress } from "@/hooks/use-progress";
import { useStreak } from "@/hooks/use-streak";
import { useAzkar } from "@/hooks/use-azkar";
import { useAuthContext } from "@/providers/auth-provider";
import { getGreeting } from "@repo/utils";
import { PeriodCard } from "@/components/period-card";
import { StreakBadge } from "@/components/streak-badge";
import { Hash } from "lucide-react";
import type { ZikrCategory } from "@repo/types";

const periods: ZikrCategory[] = ["morning", "evening", "night"];

export default function HomePage() {
  const t = useTranslations("Home");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const currentPeriod = useTimePeriod();
  const { isAuthenticated } = useAuthContext();
  const { progress } = useProgress(isAuthenticated);
  const { streak } = useStreak();

  const greeting = getGreeting(currentPeriod, locale);

  // Fetch azkar counts for each period
  const { data: morningAzkar } = useAzkar("morning");
  const { data: eveningAzkar } = useAzkar("evening");
  const { data: nightAzkar } = useAzkar("night");

  const totals: Record<ZikrCategory, number> = {
    morning: morningAzkar?.length ?? 0,
    evening: eveningAzkar?.length ?? 0,
    night: nightAzkar?.length ?? 0,
  };

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
              total: totals[period],
            }}
            isCurrent={period === currentPeriod}
            onClick={() => router.push(`/azkar/${period}`)}
          />
        ))}
      </div>

      {/* Counter quick-access card */}
      <button
        type="button"
        onClick={() => router.push("/counter")}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-gold-200 dark:border-gold-800/30 bg-white dark:bg-dark-card cursor-pointer hover:shadow-[0_2px_8px_rgba(180,83,9,0.08)] transition-all text-start"
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-950/30">
          <Hash className="w-6 h-6 text-gold-600 dark:text-gold-400" />
        </div>
        <div>
          <p className="font-semibold text-gold-900 dark:text-gold-200">
            {t("counter")}
          </p>
          <p className="text-xs text-muted-foreground">{t("counterDesc")}</p>
        </div>
      </button>

      {/* Guest login prompt */}
      {!isAuthenticated && (
        <p className="text-center text-sm text-muted-foreground py-2">
          {t("loginPrompt")}
        </p>
      )}
    </div>
  );
}

"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useCounter } from "@/hooks/use-counter";
import { useAuthContext } from "@/providers/auth-provider";
import { CounterCircle } from "@/components/counter-circle";
import type { CounterPreset } from "@repo/types";

export default function CounterPage() {
  const t = useTranslations("Counter");
  const locale = useLocale() as "ar" | "en";
  const { isAuthenticated } = useAuthContext();
  const counter = useCounter(isAuthenticated);

  const { data: presets } = useQuery<CounterPreset[]>({
    queryKey: ["counter-presets"],
    queryFn: () => apiClient.getCounterPresets(),
    staleTime: 10 * 60 * 1000,
  });

  const isComplete = counter.current >= counter.target && counter.target > 0;

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
            type="button"
            onClick={() =>
              counter.selectPreset(
                String(preset.id),
                preset.targetCount,
                locale === "ar" ? preset.labelAr : preset.labelEn,
              )
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              counter.presetId === String(preset.id)
                ? "bg-gold-500 text-dark-base border-gold-500"
                : "bg-white dark:bg-dark-card border-gold-200 dark:border-gold-800/30 text-gold-700 hover:border-gold-400"
            }`}
          >
            {locale === "ar" ? preset.labelAr : preset.labelEn}
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

      {/* Target reached message */}
      {isComplete && (
        <p className="text-sm text-gold-500 font-medium animate-checkmark">
          {t("targetReached")}
        </p>
      )}

      {/* Reset */}
      <button
        type="button"
        onClick={counter.reset}
        className="px-6 py-2 rounded-xl border border-gold-300 dark:border-gold-800/30 text-gold-700 hover:bg-gold-50 dark:hover:bg-dark-elevated transition-colors"
      >
        {t("reset")}
      </button>
    </div>
  );
}

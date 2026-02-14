"use client";

import { useTranslations } from "next-intl";
import { Flame } from "lucide-react";

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
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

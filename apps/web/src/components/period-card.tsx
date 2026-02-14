"use client";

import { useTranslations } from "next-intl";
import { Sunrise, Sunset, Moon } from "lucide-react";
import type { ZikrCategory } from "@repo/types";
import type { ComponentType } from "react";

interface PeriodCardProps {
  period: ZikrCategory;
  progress: { completed: number; total: number };
  isCurrent: boolean;
  onClick: () => void;
}

const icons: Record<ZikrCategory, ComponentType<{ className?: string }>> = {
  morning: Sunrise,
  evening: Sunset,
  night: Moon,
};

export function PeriodCard({
  period,
  progress,
  isCurrent,
  onClick,
}: PeriodCardProps) {
  const t = useTranslations("Period");
  const Icon = icons[period];
  const pct =
    progress.total > 0
      ? Math.round((progress.completed / progress.total) * 100)
      : 0;
  const isComplete = progress.total > 0 && progress.completed >= progress.total;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-start
        ${
          isCurrent
            ? "border-gold-500 bg-gold-50 dark:bg-gold-950/20 shadow-[0_0_0_1px_rgba(245,158,11,0.3)]"
            : "border-gold-200 dark:border-gold-800/30 bg-white dark:bg-dark-card"
        }
        hover:shadow-[0_2px_8px_rgba(180,83,9,0.08)]`}
    >
      {/* Icon */}
      <div
        className={`flex items-center justify-center w-12 h-12 rounded-xl ${
          isCurrent
            ? "bg-gold-500 text-dark-base"
            : "bg-gold-100 dark:bg-gold-950/30 text-gold-600 dark:text-gold-400"
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gold-900 dark:text-gold-200">
          {t(period)}
        </p>
        <p className="text-xs text-muted-foreground">
          {progress.completed}/{progress.total}
          {isComplete && " ✓"}
        </p>
      </div>

      {/* Progress ring */}
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-gold-200 dark:stroke-dark-elevated"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            className="stroke-gold-500 transition-all duration-500"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${pct * 0.88} 88`}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gold-700 dark:text-gold-400">
          {pct}%
        </span>
      </div>
    </button>
  );
}

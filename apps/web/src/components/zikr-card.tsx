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
  zikr,
  isCompleted,
  currentCount,
  isFavorite,
  onToggleFavorite,
  onClick,
  locale,
}: ZikrCardProps) {
  const inProgress =
    currentCount !== undefined && currentCount > 0 && !isCompleted;

  return (
    <Card
      className={`relative p-5 cursor-pointer transition-all rounded-xl border
        ${
          isCompleted
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
      <p className="text-arabic-lg text-right leading-relaxed mb-3 pe-12 dark:text-gold-200">
        {zikr.arabicText}
      </p>

      {/* Translation */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
        {locale === "ar" ? zikr.translationAr : zikr.translationEn}
      </p>

      {/* Footer: reference + status + favorite */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gold-700 dark:text-gold-700">
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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1 transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite
                  ? "fill-gold-500 text-gold-500"
                  : "text-gold-300 dark:text-gold-700"
              }`}
            />
          </button>
        </div>
      </div>
    </Card>
  );
}

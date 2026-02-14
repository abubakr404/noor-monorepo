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
import type { ZikrCategory } from "@repo/types";

export default function ZikrDetailPage() {
  const params = useParams();
  const category = params.category as ZikrCategory;
  const id = Number(params.id);
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("ZikrDetail");
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  const { data: azkar } = useAzkar(category);
  const { progress, markZikrComplete, updateInProgress } =
    useProgress(isAuthenticated);
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
    if (!isCompleted && counterMode === "display") {
      markZikrComplete(category, id);
    }
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
        <button
          type="button"
          onClick={() => router.push(`/azkar/${category}`)}
          className="p-2 -ml-2 rounded-lg hover:bg-gold-100 dark:hover:bg-dark-elevated transition-colors"
        >
          {locale === "ar" ? (
            <ArrowRight className="w-5 h-5 text-gold-700" />
          ) : (
            <ArrowLeft className="w-5 h-5 text-gold-700" />
          )}
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(id)}
          className="p-2 -mr-2 rounded-lg hover:bg-gold-100 dark:hover:bg-dark-elevated transition-colors"
        >
          <Heart
            className={`w-6 h-6 ${
              isFavorite(id)
                ? "fill-gold-500 text-gold-500"
                : "text-gold-300 dark:text-gold-700"
            }`}
          />
        </button>
      </div>

      {/* Arabic text */}
      <p className="text-arabic-xl text-center leading-loose dark:text-gold-200 px-2">
        {zikr.arabicText}
      </p>

      {/* Translation */}
      <p className="text-center text-muted-foreground text-sm">
        {locale === "ar" ? zikr.translationAr : zikr.translationEn}
      </p>

      {/* Counter or display mode */}
      {counterMode === "interactive" ? (
        <div className="flex justify-center py-4">
          <ZikrCounter
            current={currentCount}
            target={zikr.repeatCount}
            onTap={handleTap}
          />
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
        <p className="text-xs text-gold-700 dark:text-gold-700 text-center">
          {zikr.reference}
        </p>
      )}

      {/* Virtue */}
      {(zikr.virtueAr ?? zikr.virtueEn) && (
        <div className="p-4 rounded-xl bg-gold-50 dark:bg-dark-elevated border border-gold-200 dark:border-gold-800/30">
          <p className="text-sm text-gold-800 dark:text-gold-300 text-center">
            {locale === "ar" ? zikr.virtueAr : zikr.virtueEn}
          </p>
        </div>
      )}

      {/* Next / Back to Home button */}
      {(isCompleted || counterMode === "display") && (
        <button
          type="button"
          onClick={handleNext}
          className="w-full h-12 rounded-xl bg-gold-500 text-dark-base font-semibold transition-colors hover:bg-gold-400 active:bg-gold-600"
        >
          {isLast ? t("backToHome") : t("next")}
        </button>
      )}
    </div>
  );
}

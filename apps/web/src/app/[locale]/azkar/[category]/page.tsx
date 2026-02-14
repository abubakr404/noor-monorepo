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
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ZikrCategory } from "@repo/types";

export default function AzkarCategoryPage() {
  const params = useParams();
  const category = params.category as ZikrCategory;
  const locale = useLocale() as "ar" | "en";
  const t = useTranslations("Azkar");
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();

  const { data: azkar, isLoading } = useAzkar(category);
  const { progress, resetCategory } = useProgress(isAuthenticated);
  const { isFavorite, toggle: toggleFavorite } = useFavorites(isAuthenticated);

  const catProgress = progress[category];

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-12 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!azkar) return null;

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      {/* Header with back arrow */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="p-2 -ml-2 rounded-lg hover:bg-gold-100 dark:hover:bg-dark-elevated transition-colors"
        >
          {locale === "ar" ? (
            <ArrowRight className="w-5 h-5 text-gold-700" />
          ) : (
            <ArrowLeft className="w-5 h-5 text-gold-700" />
          )}
        </button>
        <h1 className="text-xl font-bold text-gold-900 dark:text-gold-200">
          {t(`title.${category}`)}
        </h1>
      </div>

      <ProgressHeader
        completed={catProgress.completed.length}
        total={azkar.length}
      />

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

      {/* Reset all button */}
      <button
        type="button"
        onClick={() => resetCategory(category)}
        className="w-full py-3 text-sm text-gold-700 dark:text-gold-500 hover:text-gold-900 dark:hover:text-gold-300 transition-colors"
      >
        {t("resetAll")}
      </button>
    </div>
  );
}

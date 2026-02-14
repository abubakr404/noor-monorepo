"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/navigation";
import { useAllAzkar } from "@/hooks/use-azkar";
import { useFavorites } from "@/hooks/use-favorites";
import { useProgress } from "@/hooks/use-progress";
import { useAuthContext } from "@/providers/auth-provider";
import { ZikrCard } from "@/components/zikr-card";
import { Heart } from "lucide-react";

export default function FavoritesPage() {
  const t = useTranslations("Favorites");
  const locale = useLocale() as "ar" | "en";
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { data: allAzkar, isLoading } = useAllAzkar();
  const { favorites, toggle: toggleFavorite, isFavorite } =
    useFavorites(isAuthenticated);
  const { progress } = useProgress(isAuthenticated);

  const favoriteAzkar =
    allAzkar?.filter((z) => favorites.includes(z.id)) ?? [];

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-12 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <h1 className="text-xl font-bold text-gold-900 dark:text-gold-200">
        {t("title")}
      </h1>

      {favoriteAzkar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Heart className="w-12 h-12 text-gold-300 dark:text-gold-700" />
          <p className="text-muted-foreground font-medium">{t("empty")}</p>
          <p className="text-sm text-muted-foreground text-center">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {favoriteAzkar.map((zikr) => {
            const catProgress = progress[zikr.category];
            return (
              <ZikrCard
                key={zikr.id}
                zikr={zikr}
                isCompleted={catProgress.completed.includes(zikr.id)}
                currentCount={catProgress.inProgress[zikr.id]}
                isFavorite={isFavorite(zikr.id)}
                onToggleFavorite={() => toggleFavorite(zikr.id)}
                onClick={() =>
                  router.push(`/azkar/${zikr.category}/${zikr.id}`)
                }
                locale={locale}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

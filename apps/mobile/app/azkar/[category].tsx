import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAzkar } from "../../src/hooks/use-azkar";
import { useProgress } from "../../src/hooks/use-progress";
import { useFavorites } from "../../src/hooks/use-favorites";
import { useAuth } from "../../src/hooks/use-auth";
import { ZikrCard } from "../../src/components/zikr-card";
import type { ZikrCategory } from "@repo/types";

const titles: Record<ZikrCategory, string> = {
  morning: "أذكار الصباح",
  evening: "أذكار المساء",
  night: "أذكار النوم",
};

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: ZikrCategory }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const { data: azkar, isLoading } = useAzkar(category as ZikrCategory);
  const { progress, resetCategory } = useProgress(isAuthenticated);
  const { isFavorite, toggle: toggleFavorite } = useFavorites(isAuthenticated);

  const catProgress = progress[category as ZikrCategory];

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-gold-500 text-right">→ رجوع</Text>
        </Pressable>

        <Text className="text-xl font-bold text-gold-200 text-right mb-2">
          {titles[category as ZikrCategory] ?? category}
        </Text>

        {/* Progress */}
        <Text className="text-xs text-gold-700 text-right mb-4">
          {catProgress?.completed.length ?? 0}/{azkar?.length ?? 0} مكتمل
        </Text>

        {isLoading && (
          <Text className="text-gold-700 text-center py-8">
            جارٍ التحميل...
          </Text>
        )}

        <View className="gap-3">
          {azkar?.map((zikr) => (
            <ZikrCard
              key={zikr.id}
              zikr={zikr}
              isCompleted={catProgress?.completed.includes(zikr.id) ?? false}
              currentCount={catProgress?.inProgress[zikr.id]}
              isFavorite={isFavorite(zikr.id)}
              onToggleFavorite={() => toggleFavorite(zikr.id)}
              onPress={() => router.push(`/azkar/${category}/${zikr.id}`)}
            />
          ))}
        </View>

        {/* Reset */}
        <Pressable
          onPress={() => resetCategory(category as ZikrCategory)}
          className="mt-4 py-3"
        >
          <Text className="text-sm text-gold-700 text-center">
            إعادة تعيين الكل
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

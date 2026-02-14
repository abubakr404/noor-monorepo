import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAzkar } from "../../../src/hooks/use-azkar";
import { useProgress } from "../../../src/hooks/use-progress";
import { useFavorites } from "../../../src/hooks/use-favorites";
import { usePreferences } from "../../../src/hooks/use-preferences";
import { useAuth } from "../../../src/hooks/use-auth";
import { useHaptics } from "../../../src/hooks/use-haptics";
import { CounterCircle } from "../../../src/components/counter-circle";
import { Heart } from "lucide-react-native";
import type { ZikrCategory } from "@repo/types";

const GOLD_500 = "#F59E0B";
const GOLD_700 = "#B45309";

export default function ZikrDetailScreen() {
  const { category, id } = useLocalSearchParams<{
    category: string;
    id: string;
  }>();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const haptics = useHaptics();

  const { data: azkar } = useAzkar(category as ZikrCategory);
  const { progress, markZikrComplete, updateInProgress } =
    useProgress(isAuthenticated);
  const { isFavorite, toggle: toggleFavorite } = useFavorites(isAuthenticated);
  const { counterMode } = usePreferences(isAuthenticated);

  const zikr = azkar?.find((z) => z.id === Number(id));
  if (!zikr || !azkar) {
    return (
      <View className="flex-1 bg-dark-base items-center justify-center">
        <Text className="text-gold-700">جارٍ التحميل...</Text>
      </View>
    );
  }

  const currentIndex = azkar.findIndex((z) => z.id === Number(id));
  const isLast = currentIndex === azkar.length - 1;
  const nextZikr = !isLast ? azkar[currentIndex + 1] : null;

  const catProgress = progress[category as ZikrCategory];
  const isCompleted = catProgress.completed.includes(Number(id));
  const currentCount = catProgress.inProgress[Number(id)] ?? 0;

  const handleTap = () => {
    const newCount = currentCount + 1;
    haptics.light();
    if (newCount >= zikr.repeatCount) {
      markZikrComplete(category as ZikrCategory, Number(id));
      haptics.success();
    } else {
      updateInProgress(category as ZikrCategory, Number(id), newCount);
    }
  };

  const handleNext = () => {
    if (!isCompleted && counterMode === "display") {
      markZikrComplete(category as ZikrCategory, Number(id));
    }
    if (nextZikr) {
      router.replace(`/azkar/${category}/${nextZikr.id}`);
    } else {
      router.replace("/");
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <Pressable onPress={() => toggleFavorite(Number(id))}>
            <Heart
              size={24}
              color={isFavorite(Number(id)) ? GOLD_500 : GOLD_700}
              fill={isFavorite(Number(id)) ? GOLD_500 : "none"}
            />
          </Pressable>
          <Pressable onPress={() => router.back()}>
            <Text className="text-gold-500">→ رجوع</Text>
          </Pressable>
        </View>

        {/* Arabic text */}
        <Text className="text-2xl text-gold-200 text-center leading-loose mb-4 px-2">
          {zikr.arabicText}
        </Text>

        {/* Translation */}
        {zikr.translationAr && (
          <Text className="text-sm text-gold-700 text-center mb-6">
            {zikr.translationAr}
          </Text>
        )}

        {/* Counter or display mode */}
        {counterMode === "interactive" ? (
          <View className="items-center py-4">
            <CounterCircle
              current={currentCount}
              target={zikr.repeatCount}
              onTap={handleTap}
            />
          </View>
        ) : (
          <Text className="text-lg text-gold-400 font-medium text-center py-4">
            اقرأها {zikr.repeatCount} مرات
          </Text>
        )}

        {/* Reference */}
        {zikr.reference && (
          <Text className="text-xs text-gold-700 text-center mb-4">
            {zikr.reference}
          </Text>
        )}

        {/* Virtue */}
        {zikr.virtueAr && (
          <View className="p-4 rounded-xl bg-dark-elevated border border-gold-800/30 mb-6">
            <Text className="text-sm text-gold-300 text-center">
              {zikr.virtueAr}
            </Text>
          </View>
        )}

        {/* Next / Back button */}
        {(isCompleted || counterMode === "display") && (
          <Pressable
            onPress={handleNext}
            className="h-12 rounded-xl bg-gold-500 items-center justify-center"
          >
            <Text className="font-semibold text-dark-base">
              {isLast ? "العودة للرئيسية" : "التالي"}
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

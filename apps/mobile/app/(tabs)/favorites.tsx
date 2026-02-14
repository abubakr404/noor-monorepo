import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAllAzkar } from "../../src/hooks/use-azkar";
import { useFavorites } from "../../src/hooks/use-favorites";
import { useProgress } from "../../src/hooks/use-progress";
import { useAuth } from "../../src/hooks/use-auth";
import { ZikrCard } from "../../src/components/zikr-card";
import { Heart } from "lucide-react-native";

export default function FavoritesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: allAzkar } = useAllAzkar();
  const { favorites, toggle, isFavorite } = useFavorites(isAuthenticated);
  const { progress } = useProgress(isAuthenticated);

  const favoriteAzkar =
    allAzkar?.filter((z) => favorites.includes(z.id)) ?? [];

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        <Text className="text-xl font-bold text-gold-200 text-right mb-4">
          المفضلة
        </Text>

        {favoriteAzkar.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Heart size={48} color="#B45309" />
            <Text className="text-lg font-medium text-gold-200 mt-4">
              لا توجد مفضلات بعد
            </Text>
            <Text className="text-sm text-gold-700 mt-2 text-center">
              أضف أذكارك المفضلة بالنقر على القلب
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            {favoriteAzkar.map((zikr) => {
              const catProgress = progress[zikr.category];
              return (
                <ZikrCard
                  key={zikr.id}
                  zikr={zikr}
                  isCompleted={catProgress.completed.includes(zikr.id)}
                  currentCount={catProgress.inProgress[zikr.id]}
                  isFavorite={isFavorite(zikr.id)}
                  onToggleFavorite={() => toggle(zikr.id)}
                  onPress={() =>
                    router.push(`/azkar/${zikr.category}/${zikr.id}`)
                  }
                />
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

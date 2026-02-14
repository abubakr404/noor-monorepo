import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import type { Zikr, ZikrCategory } from "@repo/types";

const API_URL = "http://localhost:3001/api/v1";

const titles: Record<ZikrCategory, string> = {
  morning: "أذكار الصباح",
  evening: "أذكار المساء",
  night: "أذكار النوم",
};

export default function AzkarCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: ZikrCategory }>();
  const router = useRouter();

  const { data: azkar, isLoading } = useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/azkar?category=${category}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-gold-500 text-right">→ رجوع</Text>
        </Pressable>

        <Text className="text-xl font-bold text-gold-200 text-right mb-4">
          {titles[category as ZikrCategory] ?? category}
        </Text>

        {isLoading && (
          <Text className="text-gold-700 text-center py-8">
            جارٍ التحميل...
          </Text>
        )}

        <View className="gap-3">
          {azkar?.map((zikr) => (
            <Pressable
              key={zikr.id}
              onPress={() =>
                router.push(`/azkar/${category}/${zikr.id}`)
              }
              className="p-4 rounded-xl border border-gold-800/30 bg-dark-card"
            >
              <Text className="text-arabic-lg text-gold-200 text-right leading-loose mb-2">
                {zikr.arabicText}
              </Text>
              <View className="flex-row justify-between items-center">
                <View className="bg-gold-500 w-7 h-7 rounded-full items-center justify-center">
                  <Text className="text-xs font-bold text-dark-base">
                    {zikr.repeatCount}
                  </Text>
                </View>
                <Text className="text-xs text-gold-700">{zikr.reference}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

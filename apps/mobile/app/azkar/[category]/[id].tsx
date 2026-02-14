import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import type { Zikr, ZikrCategory } from "@repo/types";

const API_URL = "http://localhost:3001/api/v1";

export default function ZikrDetailScreen() {
  const { category, id } = useLocalSearchParams<{
    category: ZikrCategory;
    id: string;
  }>();
  const router = useRouter();
  const [count, setCount] = useState(0);

  const { data: azkar } = useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/azkar?category=${category}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const zikr = azkar?.find((z) => z.id === Number(id));
  if (!zikr) {
    return (
      <View className="flex-1 bg-dark-base items-center justify-center">
        <Text className="text-gold-700">جارٍ التحميل...</Text>
      </View>
    );
  }

  const currentIndex = azkar?.findIndex((z) => z.id === Number(id)) ?? 0;
  const isLast = currentIndex === (azkar?.length ?? 0) - 1;
  const nextZikr = !isLast && azkar ? azkar[currentIndex + 1] : null;
  const isComplete = count >= zikr.repeatCount;

  const handleTap = async () => {
    if (isComplete) return;
    const newCount = count + 1;
    setCount(newCount);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNext = () => {
    setCount(0);
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
        <Pressable onPress={() => router.back()} className="mb-6">
          <Text className="text-gold-500 text-right">→ رجوع</Text>
        </Pressable>

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

        {/* Counter */}
        <Pressable
          onPress={handleTap}
          className="self-center w-48 h-48 rounded-full border-4 border-gold-500 items-center justify-center mb-6"
        >
          <Text
            className={`text-4xl font-extrabold ${isComplete ? "text-gold-500" : "text-gold-200"}`}
          >
            {count}
          </Text>
          <Text className="text-sm text-gold-700">/ {zikr.repeatCount}</Text>
        </Pressable>

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
        {isComplete && (
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

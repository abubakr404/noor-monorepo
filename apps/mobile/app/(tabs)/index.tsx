import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { getCurrentTimePeriod, getGreeting } from "@repo/utils";
import type { ZikrCategory } from "@repo/types";

const periods: ZikrCategory[] = ["morning", "evening", "night"];

const periodLabels: Record<ZikrCategory, { ar: string; en: string }> = {
  morning: { ar: "أذكار الصباح", en: "Morning Azkar" },
  evening: { ar: "أذكار المساء", en: "Evening Azkar" },
  night: { ar: "أذكار النوم", en: "Night Azkar" },
};

export default function HomeScreen() {
  const router = useRouter();
  const currentPeriod = getCurrentTimePeriod();
  const greeting = getGreeting(currentPeriod, "ar");

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        {/* Greeting */}
        <Text className="text-2xl font-bold text-gold-200 text-right mb-1">
          {greeting}
        </Text>
        <Text className="text-sm text-gold-700 text-right mb-6">
          ابدأ يومك بالذكر
        </Text>

        {/* Period cards */}
        <View className="gap-3">
          {periods.map((period) => {
            const isCurrent = period === currentPeriod;
            return (
              <Pressable
                key={period}
                onPress={() => router.push(`/azkar/${period}`)}
                className={`flex-row items-center p-4 rounded-xl border ${
                  isCurrent
                    ? "border-gold-500 bg-gold-950/20"
                    : "border-gold-800/30 bg-dark-card"
                }`}
              >
                <View className="flex-1">
                  <Text className="font-semibold text-gold-200 text-right">
                    {periodLabels[period].ar}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Counter quick access */}
        <Pressable
          onPress={() => router.push("/counter")}
          className="mt-4 flex-row items-center p-4 rounded-xl border border-gold-800/30 bg-dark-card"
        >
          <View className="flex-1">
            <Text className="font-semibold text-gold-200 text-right">
              عدّاد التسبيح
            </Text>
            <Text className="text-xs text-gold-700 text-right">
              سبّح واحصِ
            </Text>
          </View>
        </Pressable>
      </View>
    </ScrollView>
  );
}

import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTimePeriod } from "../../src/hooks/use-time-period";
import { useProgress } from "../../src/hooks/use-progress";
import { useStreak } from "../../src/hooks/use-streak";
import { useAzkar } from "../../src/hooks/use-azkar";
import { useAuth } from "../../src/hooks/use-auth";
import { getGreeting } from "@repo/utils";
import { PeriodCard } from "../../src/components/period-card";
import { StreakBadge } from "../../src/components/streak-badge";
import type { ZikrCategory } from "@repo/types";

const periods: ZikrCategory[] = ["morning", "evening", "night"];

const periodLabels: Record<ZikrCategory, string> = {
  morning: "أذكار الصباح",
  evening: "أذكار المساء",
  night: "أذكار النوم",
};

export default function HomeScreen() {
  const router = useRouter();
  const currentPeriod = useTimePeriod();
  const greeting = getGreeting(currentPeriod, "ar");
  const { isAuthenticated } = useAuth();
  const { progress } = useProgress(isAuthenticated);
  const { streak } = useStreak();

  const { data: morningAzkar } = useAzkar("morning");
  const { data: eveningAzkar } = useAzkar("evening");
  const { data: nightAzkar } = useAzkar("night");

  const totals: Record<ZikrCategory, number> = {
    morning: morningAzkar?.length ?? 0,
    evening: eveningAzkar?.length ?? 0,
    night: nightAzkar?.length ?? 0,
  };

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        {/* Greeting + Streak */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gold-200 text-right">
              {greeting}
            </Text>
            <Text className="text-sm text-gold-700 text-right">
              ابدأ يومك بالذكر
            </Text>
          </View>
          <StreakBadge count={streak} />
        </View>

        {/* Period cards */}
        <View className="gap-3 mb-4">
          {periods.map((period) => (
            <PeriodCard
              key={period}
              period={period}
              label={periodLabels[period]}
              completed={progress[period].completed.length}
              total={totals[period]}
              isCurrent={period === currentPeriod}
              onPress={() => router.push(`/azkar/${period}`)}
            />
          ))}
        </View>

        {/* Counter quick access */}
        <Pressable
          onPress={() => router.push("/counter")}
          className="flex-row items-center p-4 rounded-xl border border-gold-800/30 bg-dark-card"
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

        {/* Guest login prompt */}
        {!isAuthenticated && (
          <Pressable
            onPress={() => router.push("/auth/login")}
            className="mt-4"
          >
            <Text className="text-center text-sm text-gold-700">
              سجّل دخولك لحفظ تقدمك
            </Text>
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

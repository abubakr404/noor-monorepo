import { View, Text, Pressable } from "react-native";
import { Sunrise, Sunset, Moon } from "lucide-react-native";
import type { ZikrCategory } from "@repo/types";
import type { LucideIcon } from "lucide-react-native";

interface PeriodCardProps {
  period: ZikrCategory;
  label: string;
  completed: number;
  total: number;
  isCurrent: boolean;
  onPress: () => void;
}

const GOLD_500 = "#F59E0B";
const GOLD_600 = "#D97706";

const icons: Record<ZikrCategory, LucideIcon> = {
  morning: Sunrise,
  evening: Sunset,
  night: Moon,
};

export function PeriodCard({
  period,
  label,
  completed,
  total,
  isCurrent,
  onPress,
}: PeriodCardProps) {
  const Icon = icons[period];
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-xl border ${
        isCurrent
          ? "border-gold-500 bg-gold-950/20"
          : "border-gold-800/30 bg-dark-card"
      }`}
    >
      <View
        className={`w-11 h-11 rounded-xl items-center justify-center ${
          isCurrent ? "bg-gold-500" : "bg-gold-950/30"
        }`}
      >
        <Icon color={isCurrent ? "#0D0B08" : GOLD_600} size={22} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-gold-200">{label}</Text>
        <Text className="text-xs text-gold-700">
          {completed}/{total}
        </Text>
      </View>
      <Text className="text-sm font-bold text-gold-500">{pct}%</Text>
    </Pressable>
  );
}

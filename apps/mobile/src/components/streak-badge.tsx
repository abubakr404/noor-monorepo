import { View, Text } from "react-native";
import { Flame } from "lucide-react-native";

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  if (count === 0) return null;

  return (
    <View className="flex-row items-center gap-1 px-3 py-1.5 rounded-full bg-gold-950/30 border border-gold-800/40">
      <Flame size={14} color="#F59E0B" />
      <Text className="text-sm font-medium text-gold-300">
        اليوم {count}
      </Text>
    </View>
  );
}

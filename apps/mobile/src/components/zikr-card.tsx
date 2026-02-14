import { View, Text, Pressable } from "react-native";
import { Heart, Check } from "lucide-react-native";
import { StarBadge } from "./star-badge";
import type { Zikr } from "@repo/types";

interface ZikrCardProps {
  zikr: Zikr;
  isCompleted: boolean;
  currentCount?: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPress: () => void;
}

const GOLD_500 = "#F59E0B";
const GOLD_300 = "#FCD34D";
const GOLD_700 = "#B45309";

export function ZikrCard({
  zikr,
  isCompleted,
  currentCount,
  isFavorite,
  onToggleFavorite,
  onPress,
}: ZikrCardProps) {
  const inProgress =
    currentCount !== undefined && currentCount > 0 && !isCompleted;

  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-xl border ${
        isCompleted
          ? "border-gold-500/50 bg-gold-950/10"
          : "border-gold-800/30 bg-dark-card"
      }`}
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1 pr-3">
          <Text className="text-lg text-gold-200 text-right leading-loose">
            {zikr.arabicText}
          </Text>
        </View>
        <StarBadge count={zikr.repeatCount} />
      </View>

      <View className="flex-row justify-between items-center mt-2">
        <Pressable onPress={onToggleFavorite} hitSlop={8}>
          <Heart
            size={20}
            color={isFavorite ? GOLD_500 : GOLD_700}
            fill={isFavorite ? GOLD_500 : "none"}
          />
        </Pressable>
        <View className="flex-row items-center gap-2">
          {isCompleted && <Check size={18} color={GOLD_500} />}
          {inProgress && (
            <Text className="text-xs text-gold-600 font-medium">
              {currentCount}/{zikr.repeatCount}
            </Text>
          )}
          <Text className="text-xs text-gold-700">{zikr.reference}</Text>
        </View>
      </View>
    </Pressable>
  );
}

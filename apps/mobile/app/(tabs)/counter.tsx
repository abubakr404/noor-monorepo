import { View, Text, Pressable } from "react-native";
import { useState } from "react";

export default function CounterScreen() {
  const [count, setCount] = useState(0);
  const target = 33;
  const isComplete = count >= target;

  return (
    <View className="flex-1 bg-dark-base items-center justify-center px-4">
      <Text className="text-xl font-bold text-gold-200 mb-8">
        عدّاد التسبيح
      </Text>

      {/* Counter circle */}
      <Pressable
        onPress={() => !isComplete && setCount((c) => c + 1)}
        className="w-56 h-56 rounded-full border-4 border-gold-500 items-center justify-center mb-8"
      >
        <Text
          className={`text-5xl font-extrabold ${isComplete ? "text-gold-500" : "text-gold-200"}`}
        >
          {count}
        </Text>
        <Text className="text-sm text-gold-700 mt-1">/ {target}</Text>
      </Pressable>

      {isComplete && (
        <Text className="text-sm text-gold-500 font-medium mb-4">
          أحسنت! أكملت العدد
        </Text>
      )}

      <Pressable
        onPress={() => setCount(0)}
        className="px-6 py-3 rounded-xl border border-gold-800/30"
      >
        <Text className="text-gold-700 font-medium">إعادة تعيين</Text>
      </Pressable>
    </View>
  );
}

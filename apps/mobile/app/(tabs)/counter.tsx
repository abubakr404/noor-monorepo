import { View, Text, Pressable } from "react-native";
import { useCounter } from "../../src/hooks/use-counter";
import { useAuth } from "../../src/hooks/use-auth";
import { useHaptics } from "../../src/hooks/use-haptics";
import { CounterCircle } from "../../src/components/counter-circle";

export default function CounterScreen() {
  const { isAuthenticated } = useAuth();
  const counter = useCounter(isAuthenticated);
  const haptics = useHaptics();

  const isComplete = counter.current >= counter.target && counter.target > 0;

  const handleTap = () => {
    if (isComplete) return;
    counter.increment();
    haptics.light();
    if (counter.current + 1 >= counter.target) {
      haptics.success();
    }
  };

  return (
    <View className="flex-1 bg-dark-base items-center justify-center px-4">
      <Text className="text-xl font-bold text-gold-200 mb-8">
        عدّاد التسبيح
      </Text>

      <CounterCircle
        current={counter.current}
        target={counter.target}
        onTap={handleTap}
      />

      {counter.customLabel && (
        <Text className="text-lg font-medium text-gold-300 mt-4">
          {counter.customLabel}
        </Text>
      )}

      {isComplete && (
        <Text className="text-sm text-gold-500 font-medium mt-4">
          أحسنت! أكملت العدد
        </Text>
      )}

      <Pressable
        onPress={counter.reset}
        className="mt-6 px-6 py-3 rounded-xl border border-gold-800/30"
      >
        <Text className="text-gold-700 font-medium">إعادة تعيين</Text>
      </Pressable>
    </View>
  );
}

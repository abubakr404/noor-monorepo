import { Pressable, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CounterCircleProps {
  current: number;
  target: number;
  onTap: () => void;
}

export function CounterCircle({ current, target, onTap }: CounterCircleProps) {
  const progress = target > 0 ? Math.min(current / target, 1) : 0;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);
  const isComplete = current >= target && target > 0;

  return (
    <Pressable
      onPress={onTap}
      style={{ width: 224, height: 224, alignItems: "center", justifyContent: "center" }}
    >
      <Svg
        width={224}
        height={224}
        viewBox="0 0 200 200"
        style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={100}
          cy={100}
          r={90}
          fill="none"
          stroke="#262015"
          strokeWidth={6}
        />
        <Circle
          cx={100}
          cy={100}
          r={90}
          fill="none"
          stroke={isComplete ? "#FBBF24" : "#F59E0B"}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            fontSize: 48,
            fontWeight: "800",
            color: isComplete ? "#F59E0B" : "#FDE68A",
          }}
        >
          {current}
        </Text>
        <Text style={{ fontSize: 14, color: "#B45309", marginTop: 2 }}>
          / {target}
        </Text>
      </View>
    </Pressable>
  );
}

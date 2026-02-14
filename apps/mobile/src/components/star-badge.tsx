import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";

interface StarBadgeProps {
  count: number;
  size?: number;
}

export function StarBadge({ count, size = 28 }: StarBadgeProps) {
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        style={{ position: "absolute" }}
      >
        <Path
          d="M16 0l4.24 7.76L28 4l-3.76 8.24L32 16l-7.76 4.24L28 28l-8.24-3.76L16 32l-4.24-7.76L4 28l3.76-8.24L0 16l7.76-4.24L4 4l8.24 3.76z"
          fill="#F59E0B"
        />
      </Svg>
      <Text
        style={{ fontSize: size * 0.35, fontWeight: "bold", color: "#0D0B08" }}
      >
        {count}
      </Text>
    </View>
  );
}

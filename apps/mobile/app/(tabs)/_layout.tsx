import { Tabs } from "expo-router";
import { Home, Hash, Heart, Settings } from "lucide-react-native";

const GOLD_500 = "#F59E0B";
const GOLD_700 = "#B45309";
const DARK_BASE = "#0D0B08";
const DARK_CARD = "#1A1510";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: GOLD_500,
        tabBarInactiveTintColor: GOLD_700,
        tabBarStyle: {
          backgroundColor: DARK_CARD,
          borderTopColor: "rgba(180,83,9,0.2)",
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontFamily: "Tajawal",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: "العدّاد",
          tabBarIcon: ({ color, size }) => <Hash color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "المفضلة",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

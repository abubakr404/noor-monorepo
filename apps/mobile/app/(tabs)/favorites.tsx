import { View, Text } from "react-native";

export default function FavoritesScreen() {
  return (
    <View className="flex-1 bg-dark-base items-center justify-center px-4">
      <Text className="text-4xl text-gold-300 mb-4">♡</Text>
      <Text className="text-lg font-medium text-gold-200">المفضلة</Text>
      <Text className="text-sm text-gold-700 mt-2 text-center">
        لا توجد مفضلات بعد{"\n"}أضف أذكارك المفضلة بالنقر على القلب
      </Text>
    </View>
  );
}

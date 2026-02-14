import { View, Text, ScrollView, Pressable } from "react-native";

export default function SettingsScreen() {
  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        <Text className="text-xl font-bold text-gold-200 text-right mb-6">
          الإعدادات
        </Text>

        {/* Language */}
        <SettingRow label="اللغة" value="العربية" />
        <SettingRow label="المظهر" value="داكن" />
        <SettingRow label="وضع العدّاد" value="تفاعلي" />

        <View className="mt-6">
          <Pressable className="py-3">
            <Text className="text-sm text-red-400 text-right">
              إعادة تعيين التقدم
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-4 border-b border-gold-800/20">
      <Text className="text-sm text-gold-700">{value}</Text>
      <Text className="text-sm font-medium text-gold-200">{label}</Text>
    </View>
  );
}

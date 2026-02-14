import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useRouter } from "expo-router";
import { usePreferences } from "../../src/hooks/use-preferences";
import { useAuth } from "../../src/hooks/use-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut, User } from "lucide-react-native";

const GOLD_500 = "#F59E0B";
const GOLD_700 = "#B45309";

export default function SettingsScreen() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuth();
  const prefs = usePreferences(isAuthenticated);

  const handleResetProgress = () => {
    Alert.alert("إعادة تعيين", "هل أنت متأكد؟ سيتم حذف كل تقدمك.", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تأكيد",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove([
            "zikr_daily_progress",
            "zikr_counter_state",
            "zikr_streak",
          ]);
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-dark-base">
      <View className="px-4 pt-14 pb-8">
        <Text className="text-xl font-bold text-gold-200 text-right mb-6">
          الإعدادات
        </Text>

        {/* Counter Mode */}
        <SectionTitle text="وضع العدّاد" />
        <View className="flex-row gap-2 mb-4">
          {(["interactive", "display"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => prefs.updatePreference("counterMode", mode)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${
                prefs.counterMode === mode
                  ? "bg-gold-500 border-gold-500"
                  : "bg-dark-card border-gold-800/30"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  prefs.counterMode === mode ? "text-dark-base" : "text-gold-700"
                }`}
              >
                {mode === "interactive" ? "تفاعلي" : "عرض فقط"}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Sound */}
        <View className="flex-row items-center justify-between py-3 border-b border-gold-800/20">
          <Switch
            value={prefs.soundEnabled}
            onValueChange={(v) => prefs.updatePreference("soundEnabled", v)}
            trackColor={{ false: "#262015", true: GOLD_500 }}
          />
          <Text className="text-sm font-medium text-gold-200">الصوت</Text>
        </View>

        {/* Vibration */}
        <View className="flex-row items-center justify-between py-3 border-b border-gold-800/20 mb-6">
          <Switch
            value={prefs.vibrationEnabled}
            onValueChange={(v) =>
              prefs.updatePreference("vibrationEnabled", v)
            }
            trackColor={{ false: "#262015", true: GOLD_500 }}
          />
          <Text className="text-sm font-medium text-gold-200">الاهتزاز</Text>
        </View>

        {/* Account */}
        <SectionTitle text="الحساب" />
        {isAuthenticated ? (
          <View className="gap-3 mb-6">
            <View className="flex-row items-center gap-3">
              <View>
                <Text className="text-sm font-medium text-gold-200 text-right">
                  {user?.name ?? user?.email}
                </Text>
                <Text className="text-xs text-gold-700 text-right">
                  {user?.email}
                </Text>
              </View>
              <View className="w-10 h-10 rounded-full bg-gold-950/30 items-center justify-center">
                <User size={20} color={GOLD_700} />
              </View>
            </View>
            <Pressable onPress={logout} className="flex-row items-center gap-2 self-end">
              <Text className="text-sm text-red-400">تسجيل الخروج</Text>
              <LogOut size={16} color="#F87171" />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => router.push("/auth/login")}
            className="h-12 rounded-xl bg-gold-500 items-center justify-center mb-6"
          >
            <Text className="font-semibold text-dark-base">تسجيل الدخول</Text>
          </Pressable>
        )}

        {/* Reset */}
        <Pressable onPress={handleResetProgress} className="py-3">
          <Text className="text-sm text-red-400 text-right">
            إعادة تعيين التقدم
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <Text className="text-sm font-medium text-gold-700 text-right mb-2">
      {text}
    </Text>
  );
}

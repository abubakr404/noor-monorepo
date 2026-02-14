import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter, Link } from "expo-router";
import { useAuth } from "../../src/hooks/use-auth";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-dark-base px-6 pt-24">
      <Text className="text-2xl font-bold text-gold-200 text-center mb-8">
        تسجيل الدخول
      </Text>

      <View className="gap-4">
        <TextInput
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#B45309"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          className="h-12 px-4 rounded-xl border border-gold-800/30 bg-dark-card text-gold-200"
        />

        <TextInput
          placeholder="كلمة المرور"
          placeholderTextColor="#B45309"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="h-12 px-4 rounded-xl border border-gold-800/30 bg-dark-card text-gold-200"
        />

        {error && (
          <Text className="text-sm text-red-400 text-center">{error}</Text>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          className="h-12 rounded-xl bg-gold-500 items-center justify-center"
        >
          {loading ? (
            <ActivityIndicator color="#0D0B08" />
          ) : (
            <Text className="font-semibold text-dark-base">تسجيل الدخول</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row justify-center mt-6">
        <Link href="/auth/register">
          <Text className="text-gold-500 font-medium">ليس لديك حساب؟ سجّل الآن</Text>
        </Link>
      </View>
    </View>
  );
}

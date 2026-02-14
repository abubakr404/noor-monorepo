"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/navigation";
import { useTheme } from "next-themes";
import { usePreferences } from "@/hooks/use-preferences";
import { useAuthContext } from "@/providers/auth-provider";
import { Separator } from "@repo/ui/components";
import { ChevronRight, LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { isAuthenticated, user, logout } = useAuthContext();
  const prefs = usePreferences(isAuthenticated);

  const handleLanguageSwitch = () => {
    const nextLang = prefs.language === "ar" ? "en" : "ar";
    prefs.updatePreference("language", nextLang);
    // Switch locale via router
    router.push("/settings", { locale: nextLang } as never);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    prefs.updatePreference("theme", newTheme);
    setTheme(newTheme);
  };

  const handleCounterModeChange = (mode: "interactive" | "display") => {
    prefs.updatePreference("counterMode", mode);
  };

  const handleResetProgress = () => {
    if (confirm(t("resetConfirm"))) {
      localStorage.removeItem("zikr_daily_progress");
      localStorage.removeItem("zikr_counter_state");
      localStorage.removeItem("zikr_streak");
      window.location.reload();
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
      <h1 className="text-xl font-bold text-gold-900 dark:text-gold-200">
        {t("title")}
      </h1>

      {/* Language */}
      <SettingSection title={t("language")}>
        <button
          type="button"
          onClick={handleLanguageSwitch}
          className="flex items-center justify-between w-full py-3"
        >
          <span className="text-sm text-foreground">
            {prefs.language === "ar" ? t("arabic") : t("english")}
          </span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </SettingSection>

      <Separator />

      {/* Theme */}
      <SettingSection title={t("theme")}>
        <div className="flex gap-2">
          {(["light", "dark", "system"] as const).map((th) => (
            <button
              key={th}
              type="button"
              onClick={() => handleThemeChange(th)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                theme === th
                  ? "bg-gold-500 text-dark-base border-gold-500"
                  : "bg-white dark:bg-dark-card border-gold-200 dark:border-gold-800/30 text-gold-700"
              }`}
            >
              {t(th)}
            </button>
          ))}
        </div>
      </SettingSection>

      <Separator />

      {/* Counter Mode */}
      <SettingSection title={t("counterMode")}>
        <div className="flex gap-2">
          {(["interactive", "display"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleCounterModeChange(mode)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors border ${
                prefs.counterMode === mode
                  ? "bg-gold-500 text-dark-base border-gold-500"
                  : "bg-white dark:bg-dark-card border-gold-200 dark:border-gold-800/30 text-gold-700"
              }`}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </SettingSection>

      <Separator />

      {/* Sound & Vibration */}
      <SettingSection title={t("sound")}>
        <ToggleRow
          checked={prefs.soundEnabled}
          onChange={(v) => prefs.updatePreference("soundEnabled", v)}
        />
      </SettingSection>

      <SettingSection title={t("vibration")}>
        <ToggleRow
          checked={prefs.vibrationEnabled}
          onChange={(v) => prefs.updatePreference("vibrationEnabled", v)}
        />
      </SettingSection>

      <Separator />

      {/* Account */}
      <SettingSection title={t("account")}>
        {isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-100 dark:bg-gold-950/30 flex items-center justify-center">
                <User className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user?.name ?? user?.email}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t("logout")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="w-full py-3 rounded-xl bg-gold-500 text-dark-base font-semibold hover:bg-gold-400 transition-colors"
          >
            {t("login")}
          </button>
        )}
      </SettingSection>

      <Separator />

      {/* Reset progress */}
      <button
        type="button"
        onClick={handleResetProgress}
        className="w-full py-3 text-sm text-destructive hover:text-destructive/80 transition-colors"
      >
        {t("resetProgress")}
      </button>
    </div>
  );
}

/* ── Helpers ── */

function SettingSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-gold-500" : "bg-gold-200 dark:bg-dark-elevated"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

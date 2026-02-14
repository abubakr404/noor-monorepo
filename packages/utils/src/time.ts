import type { ZikrCategory } from "@repo/types";

/**
 * Returns the current time period based on the hour of the day.
 * Morning: 5:00 – 11:59, Evening: 12:00 – 17:59, Night: 18:00 – 4:59
 */
export function getCurrentTimePeriod(): ZikrCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "evening";
  return "night";
}

const greetings: Record<ZikrCategory, { ar: string; en: string }> = {
  morning: { ar: "صباح الخير", en: "Good morning" },
  evening: { ar: "مساء الخير", en: "Good evening" },
  night: { ar: "تصبح على خير", en: "Good night" },
};

/**
 * Returns a locale-aware greeting for the given time period.
 */
export function getGreeting(
  period: ZikrCategory,
  locale: "ar" | "en",
): string {
  return greetings[period][locale];
}

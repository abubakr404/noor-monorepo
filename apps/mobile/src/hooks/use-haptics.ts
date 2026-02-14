import { useCallback } from "react";
import * as Haptics from "expo-haptics";

export function useHaptics() {
  const light = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* fallback — no haptics on web/unsupported */
    }
  }, []);

  const medium = useCallback(async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      /* fallback */
    }
  }, []);

  const success = useCallback(async () => {
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    } catch {
      /* fallback */
    }
  }, []);

  return { light, medium, success };
}

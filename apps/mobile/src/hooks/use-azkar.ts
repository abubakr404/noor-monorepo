import { useQuery } from "@tanstack/react-query";
import * as api from "../services/api";
import { getBundledAzkar } from "../services/offline-data";
import type { Zikr, ZikrCategory } from "@repo/types";

/**
 * Fetches azkar for a category. Uses bundled data as fallback if offline.
 */
export function useAzkar(category: ZikrCategory) {
  return useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    queryFn: async () => {
      try {
        return await api.fetchAzkar(category);
      } catch {
        // Offline fallback: use bundled data, cast seed shape to Zikr
        const bundled = getBundledAzkar(category);
        return bundled.map((z, i) => ({
          id: i + 1,
          arabicText: z.arabicText,
          arabicTextClean: z.arabicTextClean,
          translationEn: z.translationEn,
          translationAr: z.translationAr ?? null,
          transliteration: z.transliteration,
          repeatCount: z.repeatCount,
          reference: z.reference,
          virtueAr: z.virtueAr ?? null,
          virtueEn: z.virtueEn ?? null,
          category: z.category,
          orderIndex: z.orderIndex,
        }));
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllAzkar() {
  return useQuery<Zikr[]>({
    queryKey: ["azkar", "all"],
    queryFn: () => api.fetchAllAzkar(),
    staleTime: 5 * 60 * 1000,
  });
}

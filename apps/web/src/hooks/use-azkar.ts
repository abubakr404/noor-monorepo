"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Zikr, ZikrCategory } from "@repo/types";

/**
 * Fetches azkar for a given category from the API using TanStack Query.
 * Data is cached for 5 minutes.
 */
export function useAzkar(category: ZikrCategory) {
  return useQuery<Zikr[]>({
    queryKey: ["azkar", category],
    queryFn: () => apiClient.getAzkar(category),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetches all azkar (every category).
 */
export function useAllAzkar() {
  return useQuery<Zikr[]>({
    queryKey: ["azkar", "all"],
    queryFn: () => apiClient.getAllAzkar(),
    staleTime: 5 * 60 * 1000,
  });
}

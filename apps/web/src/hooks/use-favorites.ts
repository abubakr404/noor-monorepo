"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "@/lib/api-client";

const FAVORITES_KEY = "zikr_favorites";

export interface UseFavoritesReturn {
  favorites: number[];
  toggle: (zikrId: number) => void;
  isFavorite: (zikrId: number) => boolean;
}

export function useFavorites(isAuthenticated: boolean): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<number[]>([]);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  /* Load from localStorage on mount */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === "number")) {
          setFavorites(parsed as number[]);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* Persist on every change */
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      /* quota exceeded */
    }
  }, [favorites]);

  const toggle = useCallback((zikrId: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(zikrId);
      const next = exists
        ? prev.filter((id) => id !== zikrId)
        : [...prev, zikrId];

      /* Background API sync — deferred to avoid side-effect in updater */
      queueMicrotask(() => {
        if (!isAuthRef.current) return;
        (exists
          ? apiClient.removeFavorite(zikrId)
          : apiClient.addFavorite(zikrId)
        ).catch(() => {});
      });

      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (zikrId: number) => favorites.includes(zikrId),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}

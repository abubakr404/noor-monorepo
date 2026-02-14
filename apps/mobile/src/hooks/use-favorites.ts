import { useState, useEffect, useCallback, useRef } from "react";
import * as api from "../services/api";
import { StorageKeys, getJSON, setJSON } from "../services/storage";

export function useFavorites(isAuthenticated: boolean) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const isAuthRef = useRef(isAuthenticated);
  isAuthRef.current = isAuthenticated;

  useEffect(() => {
    const load = async () => {
      const stored = await getJSON<number[]>(StorageKeys.FAVORITES);
      if (Array.isArray(stored)) {
        setFavorites(stored);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setJSON(StorageKeys.FAVORITES, favorites);
  }, [favorites]);

  const toggle = useCallback((zikrId: number) => {
    setFavorites((prev) => {
      const exists = prev.includes(zikrId);
      const next = exists
        ? prev.filter((id) => id !== zikrId)
        : [...prev, zikrId];

      queueMicrotask(() => {
        if (!isAuthRef.current) return;
        (exists
          ? api.removeFavorite(zikrId)
          : api.addFavorite(zikrId)
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

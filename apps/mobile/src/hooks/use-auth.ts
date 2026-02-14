import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";
import { StorageKeys, setItem, removeItem, getItem } from "../services/storage";
import type { AuthTokens } from "@repo/types";

export interface UseAuthReturn {
  user: api.UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<api.UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokens = useCallback(async (tokens: AuthTokens) => {
    await setItem(StorageKeys.ACCESS_TOKEN, tokens.accessToken);
    await setItem(StorageKeys.REFRESH_TOKEN, tokens.refreshToken);
    api.setToken(tokens.accessToken);
  }, []);

  const clearTokens = useCallback(async () => {
    await removeItem(StorageKeys.ACCESS_TOKEN);
    await removeItem(StorageKeys.REFRESH_TOKEN);
    api.setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      await clearTokens();
    }
  }, [clearTokens]);

  useEffect(() => {
    const init = async () => {
      const token = await api.restoreToken();
      if (token) {
        await fetchUser();
      } else {
        const refreshToken = await getItem(StorageKeys.REFRESH_TOKEN);
        if (refreshToken) {
          try {
            const tokens = await api.refresh(refreshToken);
            await storeTokens(tokens);
            await fetchUser();
          } catch {
            await clearTokens();
          }
        }
      }
      setIsLoading(false);
    };
    init();
  }, [fetchUser, storeTokens, clearTokens]);

  const login = async (email: string, password: string) => {
    const tokens = await api.login({ email, password });
    await storeTokens(tokens);
    await fetchUser();
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
  ) => {
    const tokens = await api.register({ email, password, name });
    await storeTokens(tokens);
    await fetchUser();
  };

  const logout = () => {
    clearTokens();
  };

  return { user, isAuthenticated: !!user, isLoading, login, register, logout };
}

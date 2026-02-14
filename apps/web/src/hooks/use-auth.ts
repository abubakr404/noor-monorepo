"use client";

import { useState, useEffect, useCallback } from "react";
import { apiClient, type UserProfile } from "@/lib/api-client";
import type { AuthTokens } from "@repo/types";

const ACCESS_TOKEN_KEY = "zikr_access_token";
const REFRESH_TOKEN_KEY = "zikr_refresh_token";

export interface UseAuthReturn {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokens = useCallback((tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    apiClient.setToken(tokens.accessToken);
  }, []);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const profile = await apiClient.getMe();
      setUser(profile);
    } catch {
      clearTokens();
    }
  }, [clearTokens]);

  /* Auto-restore session on mount */
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (accessToken) {
        apiClient.setToken(accessToken);
        await fetchUser();
      } else if (refreshToken) {
        try {
          const tokens = await apiClient.refresh(refreshToken);
          storeTokens(tokens);
          await fetchUser();
        } catch {
          clearTokens();
        }
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    const tokens = await apiClient.login({ email, password });
    storeTokens(tokens);
    await fetchUser();
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
  ) => {
    const tokens = await apiClient.register({ email, password, name });
    storeTokens(tokens);
    await fetchUser();
  };

  const logout = () => clearTokens();

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };
}

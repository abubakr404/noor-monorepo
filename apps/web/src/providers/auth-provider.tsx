"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Auth context — stores JWT in localStorage.                        */
/*  NOTE: localStorage is vulnerable to XSS. For production, plan     */
/*  migration to HttpOnly cookies or a BFF proxy.                     */
/* ------------------------------------------------------------------ */

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  provider: string;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
}

/** Shape returned by the NestJS auth endpoints */
interface AuthApiResponse {
  success?: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

interface ApiErrorBody {
  error?: { message?: string };
  message?: string;
}

function extractTokens(
  json: AuthApiResponse,
): { accessToken: string; refreshToken: string } {
  const data = json.data ?? json;
  return {
    accessToken: data.accessToken ?? "",
    refreshToken: data.refreshToken ?? "",
  };
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body: unknown = await res.json();
    if (typeof body === "object" && body !== null) {
      const err = body as ApiErrorBody;
      return err.error?.message ?? err.message ?? "Request failed";
    }
  } catch {
    /* empty — fall through */
  }
  return "Request failed";
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = "zikr_access_token";
const REFRESH_TOKEN_KEY = "zikr_refresh_token";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearTokens = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setUser(null);
  }, []);

  const fetchUser = useCallback(
    async (token: string): Promise<void> => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorised");
        const json: { data?: UserProfile } = await res.json();
        setUser(json.data ?? null);
      } catch {
        clearTokens();
      }
    },
    [clearTokens],
  );

  /* Auto-restore session on mount */
  useEffect(() => {
    const init = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (accessToken) {
        await fetchUser(accessToken);
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storeTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));

    const json: AuthApiResponse = await res.json();
    const { accessToken, refreshToken } = extractTokens(json);
    storeTokens(accessToken, refreshToken);
    await fetchUser(accessToken);
  };

  const register = async (
    email: string,
    password: string,
    name?: string,
  ) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) throw new Error(await parseErrorMessage(res));

    const json: AuthApiResponse = await res.json();
    const { accessToken, refreshToken } = extractTokens(json);
    storeTokens(accessToken, refreshToken);
    await fetchUser(accessToken);
  };

  const logout = () => clearTokens();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

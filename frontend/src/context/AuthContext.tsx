import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authApi } from "../api/auth";
import { AUTH_LOGOUT_EVENT, TOKEN_STORAGE_KEY } from "../lib/api";
import { emailFromToken, isTokenExpired } from "../lib/jwt";
import { AuthContext, type AuthContextValue, type AuthUser } from "./auth-context";

function userFromStoredToken(): AuthUser | null {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token || isTokenExpired(token)) return null;
  const email = emailFromToken(token);
  return email ? { email } : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Reading localStorage is synchronous, so the initial user is derived lazily
  // at first render — no loading state or effect needed for it.
  const [user, setUser] = useState<AuthUser | null>(userFromStoredToken);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    };
    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogout);
  }, []);

  const applyToken = useCallback((token: string) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    const email = emailFromToken(token);
    setUser(email ? { email } : null);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token } = await authApi.login({ email, password });
      applyToken(token);
    },
    [applyToken],
  );

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const { token } = await authApi.register({ fullName, email, password });
      applyToken(token);
    },
    [applyToken],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

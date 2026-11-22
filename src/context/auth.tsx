import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { UserDTO } from "../../shared/types";
import { ApiRequestError, api, getAuthToken, initToken, setAuthToken } from "@/lib/api";
import { writeFavorites } from "@/lib/storage";

type AuthContextValue = {
  user: UserDTO | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await api.me();
        setUser(result.user);
        return;
      } catch (error) {
        // Only an explicit auth rejection invalidates the saved session.
        // A network or server hiccup must not sign the user out.
        if (error instanceof ApiRequestError && error.status >= 400 && error.status < 500 && error.status !== 429) {
          setAuthToken(null);
          setUser(null);
          return;
        }
        if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 400));
      }
    }
    setUser(null); // keep the token so the next launch can retry
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await initToken();
      if (!getAuthToken()) setUser(null);
      else if (!cancelled) await refresh();
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await api.login({ email, password });
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const signInDemo = useCallback(async () => {
    const result = await api.demoLogin();
    await writeFavorites(result.user.id, result.favorites);
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const result = await api.register({ name, email, password });
    setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api.logout(); } catch { /* local sign-out still succeeds */ }
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isSignedIn: user !== null, signIn, signInDemo, signUp, signOut, refresh }),
    [user, isLoading, signIn, signInDemo, signUp, signOut, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

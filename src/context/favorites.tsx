import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { readFavorites, writeFavorites } from "@/lib/storage";

type FavoritesContextValue = {
  ids: string[];
  isFavorite: (id: string) => boolean;
  toggle: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) { setIds([]); return; }
    void readFavorites(user.id).then((saved) => { if (!cancelled) setIds(saved); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const toggle = useCallback((id: string) => {
    setIds((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      if (user?.id) void writeFavorites(user.id, next);
      return next;
    });
  }, [user?.id]);

  const value = useMemo<FavoritesContextValue>(
    () => ({ ids, isFavorite: (id) => ids.includes(id), toggle }),
    [ids, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error("useFavorites must be used inside FavoritesProvider");
  return context;
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CafeDTO } from "../../shared/types";
import { useCatalog } from "@/context/catalog";
import { CAFE_KEY, readPreference, writePreference } from "@/lib/storage";

type CafeContextValue = {
  selectedCafe: CafeDTO | null;
  selectCafe: (id: string) => void;
};

const CafeContext = createContext<CafeContextValue | null>(null);

export function CafeProvider({ children }: { children: React.ReactNode }) {
  const { cafes } = useCatalog();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    void readPreference(CAFE_KEY).then(setSelectedId);
  }, []);

  const selectCafe = useCallback((id: string) => {
    setSelectedId(id);
    void writePreference(CAFE_KEY, id);
  }, []);

  const selectedCafe = useMemo(
    () => cafes.find((cafe) => cafe.id === selectedId) ?? cafes[0] ?? null,
    [cafes, selectedId],
  );

  const value = useMemo<CafeContextValue>(
    () => ({ selectedCafe, selectCafe }),
    [selectedCafe, selectCafe],
  );

  return <CafeContext.Provider value={value}>{children}</CafeContext.Provider>;
}

export function useCafe(): CafeContextValue {
  const context = useContext(CafeContext);
  if (!context) throw new Error("useCafe must be used inside CafeProvider");
  return context;
}

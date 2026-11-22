import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CafeDTO, MenuItemDTO } from "../../shared/types";
import { api } from "@/lib/api";
import { cafes as seedCafes, menuItems as seedMenu } from "@/data/menu";

type CatalogContextValue = {
  menu: MenuItemDTO[];
  cafes: CafeDTO[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const fallbackMenu: MenuItemDTO[] = seedMenu.map((item) => ({ ...item }));
const fallbackCafes: CafeDTO[] = seedCafes.map(({ selected: _selected, ...cafe }) => cafe);

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [menu, setMenu] = useState<MenuItemDTO[]>(fallbackMenu);
  const [cafes, setCafes] = useState<CafeDTO[]>(fallbackCafes);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [menuResult, cafeResult] = await Promise.all([api.getMenu(), api.getCafes()]);
      setMenu(menuResult.items);
      setCafes(cafeResult.cafes);
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load the menu");
      // Seeded data keeps the UI usable while the API is unreachable.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<CatalogContextValue>(
    () => ({ menu, cafes, isLoading, error, refresh }),
    [menu, cafes, isLoading, error, refresh],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used inside CatalogProvider");
  return context;
}

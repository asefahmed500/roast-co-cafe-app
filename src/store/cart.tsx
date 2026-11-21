import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { IllustrationName } from "@/data/menu";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  note: string;
  illustration: IllustrationName;
  tint: string;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  discount: number;
  total: number;
  promoApplied: boolean;
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  togglePromo: () => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const seed: CartLine[] = [
  {
    id: "caramel-latte",
    name: "Caramel Latte",
    price: 260,
    qty: 2,
    note: "Medium · Whole milk",
    illustration: "cup",
    tint: "#ECDCC2",
  },
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    price: 150,
    qty: 1,
    note: "Warmed",
    illustration: "croi",
    tint: "#DFE6D3",
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(seed);
  const [promoApplied, setPromoApplied] = useState(true);

  const addItem = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    setLines((current) => {
      const existing = current.find((item) => item.id === line.id);
      if (existing) {
        return current.map((item) =>
          item.id === line.id ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...current, { ...line, qty }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((current) =>
      qty <= 0
        ? current.filter((item) => item.id !== id)
        : current.map((item) => (item.id === id ? { ...item, qty } : item)),
    );
  }, []);

  const togglePromo = useCallback(() => setPromoApplied((value) => !value), []);
  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = lines.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = promoApplied ? Math.round(subtotal * 0.1) : 0;
    return {
      lines,
      count,
      subtotal,
      discount,
      total: subtotal - discount,
      promoApplied,
      addItem,
      setQty,
      togglePromo,
      clear,
    };
  }, [lines, promoApplied, addItem, setQty, togglePromo, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartLineInput, CartOptions } from "../../shared/types";
import { optionsLabel, unitPriceFor } from "../../shared/pricing";
import type { IllustrationName } from "@/data/menu";
import { useAuth } from "@/context/auth";
import { useCatalog } from "@/context/catalog";
import { api, getAuthToken } from "@/lib/api";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
  note: string;
  options?: CartOptions;
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
  promoCode: string | null;
  promoPercent: number;
  isReady: boolean;
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  hydrate: (lines: CartLineInput[]) => void;
  applyPromo: (code: string) => Promise<boolean>;
  removePromo: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const toInputs = (lines: CartLine[]): CartLineInput[] =>
  lines.map(({ id, qty, note, options }) => ({ id, qty, note, options }));

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { menu } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoPercent, setPromoPercent] = useState(0);
  const linesRef = useRef<CartLine[]>([]);
  const promoRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const lastUserId = useRef<string | null>(null);

  const sync = useCallback(() => {
    if (getAuthToken()) void api.saveCart({ lines: toInputs(linesRef.current), promoCode: promoRef.current }).catch(() => {});
  }, []);

  const setPromo = useCallback((code: string | null, percent: number) => {
    promoRef.current = code;
    setPromoCode(code);
    setPromoPercent(percent);
  }, []);

  const commit = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
    sync();
  }, [sync]);

  const addItem = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    dirtyRef.current = true;
    const current = linesRef.current;
    const existing = current.find((item) => item.id === line.id && item.note === line.note);
    const next = existing
      ? current.map((item) => item === existing ? { ...item, qty: item.qty + qty } : item)
      : [...current, { ...line, qty }];
    commit(next);
  }, [commit]);

  const setQty = useCallback((id: string, qty: number) => {
    dirtyRef.current = true;
    const current = linesRef.current;
    commit(qty <= 0
      ? current.filter((item) => item.id !== id)
      : current.map((item) => item.id === id ? { ...item, qty } : item));
  }, [commit]);

  const clear = useCallback(() => {
    dirtyRef.current = true;
    setPromo(null, 0);
    commit([]);
    sync();
  }, [commit, setPromo, sync]);

  /** A late GET /cart must never overwrite changes made by the user. */
  const hydrate = useCallback((inputs: CartLineInput[]) => {
    setIsReady(true);
    if (dirtyRef.current) return;
    const enriched = inputs.flatMap((input) => {
      const item = menu.find((entry) => entry.id === input.id);
      if (!item || input.qty <= 0) return [];
      return [{
        id: item.id,
        name: item.name,
        price: unitPriceFor(item.price, input.options),
        qty: input.qty,
        note: input.note || optionsLabel(input.options),
        options: input.options,
        illustration: item.illustration,
        tint: item.tint,
      }];
    });
    linesRef.current = enriched;
    setLines(enriched);
  }, [menu]);

  // Session changes must reset all client state: no cart, promo or dirty flag
  // may leak from one account into another.
  useEffect(() => {
    const userId = user?.id ?? null;
    if (lastUserId.current === userId) return;
    lastUserId.current = userId;
    dirtyRef.current = false;
    linesRef.current = [];
    setLines([]);
    setPromo(null, 0);
    setIsReady(false);

    if (!userId) return;
    let cancelled = false;
    api.getCart()
      .then((result) => {
        if (cancelled) return;
        hydrate(result.lines);
        if (result.promoCode) {
          void api.getPromo(result.promoCode)
            .then(({ promo }) => { if (!cancelled) setPromo(promo.code, promo.percent); })
            .catch(() => { if (!cancelled) setPromo(null, 0); });
        }
      })
      .catch(() => { if (!cancelled) hydrate([]); });
    return () => { cancelled = true; };
  }, [user?.id, hydrate, setPromo]);

  const applyPromo = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return false;
    try {
      const { promo } = await api.getPromo(trimmed);
      setPromo(promo.code, promo.percent);
      sync();
      return true;
    } catch {
      return false;
    }
  }, [setPromo, sync]);

  const removePromo = useCallback(() => {
    setPromo(null, 0);
    sync();
  }, [setPromo, sync]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = lines.reduce((sum, item) => sum + item.price * item.qty, 0);
    const promoApplied = promoCode !== null && promoPercent > 0;
    const discount = promoApplied ? Math.round(subtotal * promoPercent / 100) : 0;
    return {
      lines, count, subtotal, discount, total: subtotal - discount,
      promoApplied, promoCode, promoPercent, isReady,
      addItem, setQty, clear, hydrate, applyPromo, removePromo,
    };
  }, [lines, promoCode, promoPercent, isReady, addItem, setQty, clear, hydrate, applyPromo, removePromo]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

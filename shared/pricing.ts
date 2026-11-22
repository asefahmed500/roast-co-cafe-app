import type { CartOptions } from "./types";

/** Option surcharges shared by the client and the Worker. */
export const SIZE_DELTA: Record<CartOptions["size"], number> = { S: -20, M: 0, L: 40 };
export const MILK_DELTA: Record<CartOptions["milk"], number> = { Whole: 0, Oat: 30, Almond: 30 };

export const DEFAULT_OPTIONS: CartOptions = { size: "M", milk: "Whole" };

export function unitPriceFor(basePrice: number, options?: CartOptions): number {
  if (!options) return basePrice;
  return Math.max(0, basePrice + SIZE_DELTA[options.size] + MILK_DELTA[options.milk]);
}

export function optionsLabel(options?: CartOptions): string {
  if (!options) return "Medium · Whole milk";
  return `${options.size} · ${options.milk} milk`;
}

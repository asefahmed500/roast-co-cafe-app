import type {
  CartLineInput,
  CreateOrderInput,
  OrderDTO,
  OrderItemDTO,
  OrderStatus,
} from "../../../shared/types";
import { unitPriceFor } from "../../../shared/pricing";
import { POINTS_PER_TAKA, tierFor } from "../../../shared/loyalty";
import { all, first, run, type MenuRow, type OrderRow } from "./db";
import { errors } from "./errors";

const ETA_BY_SLOT: Record<string, number> = {
  ASAP: 10,
  "15 min": 15,
  "30 min": 30,
};

function statusFor(createdAt: string, etaMinutes: number): { status: OrderStatus; minutesLeft: number } {
  const elapsed = Math.max(0, (Date.now() - Date.parse(createdAt)) / 60_000);
  const minutesLeft = Math.max(0, Math.ceil(etaMinutes - elapsed));
  let status: OrderStatus = "received";
  if (elapsed >= etaMinutes) status = "picked_up";
  else if (elapsed >= etaMinutes * 0.6) status = "ready";
  else if (elapsed >= etaMinutes * 0.2) status = "brewing";
  return { status, minutesLeft };
}

function parseItems(blob: string): OrderItemDTO[] {
  try {
    const parsed = JSON.parse(blob);
    return Array.isArray(parsed) ? (parsed as OrderItemDTO[]) : [];
  } catch {
    return [];
  }
}

export function toOrderDTO(row: OrderRow): OrderDTO {
  const { status, minutesLeft } = statusFor(row.created_at, row.eta_minutes);
  return {
    id: row.id,
    orderNumber: row.order_number,
    status,
    items: parseItems(row.items),
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    promoCode: row.promo_code,
    paymentStatus: row.payment_status === "pay_at_counter" ? "pay_at_counter" : "pending",
    cafeId: row.cafe_id,
    mode: row.mode as OrderDTO["mode"],
    payment: row.payment as OrderDTO["payment"],
    timeSlot: row.time_slot,
    etaMinutes: row.eta_minutes,
    minutesLeft,
    createdAt: row.created_at,
  };
}

/** Prices are always recomputed server-side from the menu table. */
export async function createOrder(db: D1Database, userId: string, input: CreateOrderInput): Promise<OrderDTO> {
  const ids = [...new Set(input.items.filter((line) => line.qty > 0).map((line) => line.id))];
  if (ids.length === 0) throw errors.badRequest("Your bag is empty");

  const placeholders = ids.map(() => "?").join(",");
  const menuRows = await all<MenuRow>(
    db,
    `SELECT id, name, price, category FROM menu_items WHERE active = 1 AND id IN (${placeholders})`,
    ids,
  );
  const byId = new Map(menuRows.map((row) => [row.id, row]));
  if (byId.size !== ids.length) throw errors.badRequest("One or more items are no longer available");

  const cafe = await first<{ id: string }>(db, "SELECT id FROM cafes WHERE id = ?", [input.cafeId]);
  if (!cafe) throw errors.badRequest("That café is not available", [{ path: "cafeId", message: "Unknown café" }]);

  const items: OrderItemDTO[] = input.items
    .filter((line) => line.qty > 0)
    .map((line) => {
      const menu = byId.get(line.id)!;
      // Size/milk surcharges only apply to drinks, never to bakery items.
      const options = menu.category === "Bakery" ? undefined : line.options;
      return {
        id: menu.id,
        name: menu.name,
        qty: line.qty,
        note: line.note,
        price: unitPriceFor(menu.price, options),
      };
    });
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  let percent = 0;
  let promoCode: string | null = null;
  if (input.promoCode) {
    const promo = await first<{ code: string; percent: number }>(
      db,
      "SELECT code, percent FROM promos WHERE code = ? AND active = 1",
      [input.promoCode.toUpperCase()],
    );
    if (!promo) throw errors.badRequest("That promo code is not valid", [{ path: "promoCode", message: "Invalid promo code" }]);
    percent = promo.percent;
    promoCode = promo.code;
  }

  const discount = Math.round(subtotal * percent / 100);
  const total = subtotal - discount;
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const etaMinutes = ETA_BY_SLOT[input.timeSlot] ?? 10;
  const paymentStatus = input.payment === "cash" ? "pay_at_counter" : "pending";

  // Random order numbers with retry avoid the COUNT(*)+1 race on a UNIQUE column.
  let orderNumber = 0;
  for (let attempt = 0; attempt < 5; attempt++) {
    orderNumber = 2400 + crypto.getRandomValues(new Uint32Array(1))[0] % 7600;
    try {
      await run(
        db,
        `INSERT INTO orders
           (id, order_number, user_id, cafe_id, mode, payment, payment_status, time_slot, items,
            subtotal, discount, total, promo_code, eta_minutes, created_at, idempotency_key)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, orderNumber, userId, input.cafeId, input.mode, input.payment, paymentStatus,
          input.timeSlot, JSON.stringify(items), subtotal, discount, total, promoCode,
          etaMinutes, createdAt, input.idempotencyKey ?? null,
        ],
      );
      break;
    } catch (error) {
      if (attempt === 4) throw errors.conflict("Could not allocate an order number. Please retry.");
      void error;
    }
  }

  // Loyalty is earned on completed placement, with a tier derived from points.
  const user = await first<{ points: number }>(db, "SELECT points FROM users WHERE id = ?", [userId]);
  const points = (user?.points ?? 0) + Math.round(total * POINTS_PER_TAKA);
  await run(
    db,
    "UPDATE users SET points = ?, coffee_stamps = (coffee_stamps + 1) % 8, tier = ? WHERE id = ?",
    [points, tierFor(points), userId],
  );

  // A placed order consumes the persisted cart and its promo.
  await run(db, "DELETE FROM carts WHERE user_id = ?", [userId]);

  const row: OrderRow = {
    id, order_number: orderNumber, user_id: userId, cafe_id: input.cafeId,
    mode: input.mode, payment: input.payment, payment_status: paymentStatus,
    time_slot: input.timeSlot, items: JSON.stringify(items), subtotal, discount, total,
    promo_code: promoCode, eta_minutes: etaMinutes, created_at: createdAt,
  };
  return toOrderDTO(row);
}

export function normalizeCartLines(lines: CartLineInput[]): CartLineInput[] {
  const merged = new Map<string, CartLineInput>();
  for (const line of lines) {
    if (line.qty <= 0) continue;
    const existing = merged.get(line.id);
    merged.set(line.id, {
      id: line.id,
      qty: Math.min(99, (existing?.qty ?? 0) + line.qty),
      note: line.note,
      options: line.options,
    });
  }
  return [...merged.values()].slice(0, 50);
}

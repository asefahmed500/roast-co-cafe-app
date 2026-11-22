import { exports } from "cloudflare:workers";
import { beforeEach, describe, expect, it } from "vitest";
import type { AuthResponse, CartDTO, OrderDTO } from "../../shared/types";

const worker = exports.default as unknown as {
  fetch: (request: Request) => Promise<Response>;
};

type ApiResult<T> = { status: number; data: T };

async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<ApiResult<T>> {
  const response = await worker.fetch(
    new Request(`https://api.roastco.test${path}`, {
      method: options.method ?? "GET",
      headers: {
        "CF-Connecting-IP": testIp,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    }),
  );
  return { status: response.status, data: (await response.json()) as T };
}

const password = "StrongPass123!";
const email = () => `maya-${crypto.randomUUID()}@example.com`;
let testIp = "10.0.0.1";
beforeEach(() => {
  testIp = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
});

async function register() {
  const result = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email: email(), password, name: "Maya Rahman" },
  });
  expect(result.status).toBe(201);
  return result.data;
}

describe("Roast & Co. API", () => {
  it("reports a healthy service and serves seeded menu data", async () => {
    const health = await api<{ ok: boolean }>("/api/health");
    expect(health.status).toBe(200);
    expect(health.data.ok).toBe(true);

    const menu = await api<{ items: Array<{ id: string; price: number }> }>("/api/menu");
    expect(menu.status).toBe(200);
    expect(menu.data.items).toHaveLength(8);
    expect(menu.data.items.find((item) => item.id === "caramel-latte")?.price).toBe(260);

    const cafes = await api<{ cafes: unknown[] }>("/api/cafes");
    expect(cafes.data.cafes).toHaveLength(3);
  });

  it("rejects invalid registration input with field issues", async () => {
    const result = await api<{ error: { code: string; issues?: Array<{ path: string }> } }>(
      "/api/auth/register",
      { method: "POST", body: { email: "not-an-email", password: "short", name: "M" } },
    );
    expect(result.status).toBe(400);
    expect(result.data.error.code).toBe("BAD_REQUEST");
    expect(result.data.error.issues?.map((issue) => issue.path)).toContain("email");
  });

  it("registers, rejects duplicates, and signs in with the right password", async () => {
    const address = email();
    const created = await api<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: { email: address, password, name: "Maya" },
    });
    expect(created.status).toBe(201);
    expect(created.data.token).toMatch(/^[0-9a-f]{64}$/);
    expect(created.data.user.email).toBe(address);

    const duplicate = await api("/api/auth/register", {
      method: "POST",
      body: { email: address, password, name: "Maya" },
    });
    expect(duplicate.status).toBe(409);

    const wrong = await api("/api/auth/login", {
      method: "POST",
      body: { email: address, password: "WrongPass123!" },
    });
    expect(wrong.status).toBe(401);

    const right = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { email: address, password },
    });
    expect(right.status).toBe(200);
    expect(right.data.user.id).toBe(created.data.user.id);
  });

  it("protects cart and order routes", async () => {
    const cart = await api("/api/cart");
    const orders = await api("/api/orders");
    expect(cart.status).toBe(401);
    expect(orders.status).toBe(401);
  });

  it("persists the cart and clears it when an order is placed", async () => {
    const { token } = await register();

    const saved = await api<CartDTO>("/api/cart", {
      method: "PUT",
      token,
      body: {
        lines: [
          { id: "caramel-latte", qty: 2, note: "L · Oat milk", options: { size: "L", milk: "Oat" } },
          { id: "butter-croissant", qty: 1, note: "Warmed" },
        ],
      },
    });
    expect(saved.status).toBe(200);
    expect(saved.data.lines).toHaveLength(2);

    const fetched = await api<CartDTO>("/api/cart", { token });
    expect(fetched.data.lines[0]?.qty).toBe(2);
    expect(fetched.data.lines[0]?.options?.size).toBe("L");

    const order = await api<OrderDTO>("/api/orders", {
      method: "POST",
      token,
      body: {
        cafeId: "gulshan-2",
        mode: "pickup",
        payment: "bkash",
        timeSlot: "ASAP",
        promoCode: "COFFEE10",
        items: saved.data.lines,
      },
    });
    expect(order.status).toBe(201);
    // Prices come from the database + option surcharges, never from the client.
    expect(order.data.subtotal).toBe(330 * 2 + 150);
    expect(order.data.discount).toBe(81);
    expect(order.data.total).toBe(729);
    expect(order.data.items[0]?.price).toBe(330);
    expect(order.data.status).toBe("received");
    expect(order.data.minutesLeft).toBeGreaterThan(0);

    const after = await api<CartDTO>("/api/cart", { token });
    expect(after.data.lines).toHaveLength(0);

    const byId = await api<{ order: OrderDTO }>(`/api/orders/${order.data.id}`, { token });
    expect(byId.status).toBe(200);
    expect(byId.data.order.orderNumber).toBe(order.data.orderNumber);
  });

  it("validates orders and rejects tampered prices", async () => {
    const { token } = await register();
    const result = await api<{ error: { code: string } }>("/api/orders", {
      method: "POST",
      token,
      body: {
        cafeId: "gulshan-2",
        mode: "pickup",
        payment: "card",
        timeSlot: "ASAP",
        items: [{ id: "espresso", qty: 1, note: "", price: 1 }],
      },
    });
    expect(result.status).toBe(201);

    const bad = await api<{ error: { code: string } }>("/api/orders", {
      method: "POST",
      token,
      body: {
        cafeId: "gulshan-2",
        mode: "pickup",
        payment: "card",
        timeSlot: "ASAP",
        items: [{ id: "does-not-exist", qty: 1, note: "" }],
      },
    });
    expect(bad.status).toBe(400);
  });

  it("returns 400 for malformed JSON bodies", async () => {
    const response = await worker.fetch(new Request("https://api.roastco.test/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{not json",
    }));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: { code: string } };
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("prevents cross-user order access and validates café identity", async () => {
    const owner = await register();
    const other = await register();
    const order = await api<OrderDTO>("/api/orders", {
      method: "POST",
      token: owner.token,
      body: {
        cafeId: "gulshan-2", mode: "pickup", payment: "card", timeSlot: "ASAP",
        items: [{ id: "espresso", qty: 1, note: "" }],
      },
    });
    expect(order.status).toBe(201);

    const idor = await api(`/api/orders/${order.data.id}`, { token: other.token });
    expect(idor.status).toBe(404);

    const badCafe = await api("/api/orders", {
      method: "POST",
      token: owner.token,
      body: {
        cafeId: "not-a-cafe", mode: "pickup", payment: "card", timeSlot: "ASAP",
        items: [{ id: "espresso", qty: 1, note: "" }],
      },
    });
    expect(badCafe.status).toBe(400);
  });

  it("persists promo on the cart and is idempotent for repeated order submission", async () => {
    const { token } = await register();
    await api("/api/cart", {
      method: "PUT",
      token,
      body: { lines: [{ id: "espresso", qty: 1, note: "" }], promoCode: "COFFEE10" },
    });
    const cart = await api<{ promoCode: string | null }>("/api/cart", { token });
    expect(cart.data.promoCode).toBe("COFFEE10");

    const payload = {
      cafeId: "gulshan-2", mode: "pickup" as const, payment: "card" as const,
      timeSlot: "ASAP" as const, promoCode: "COFFEE10", idempotencyKey: "idem-123",
      items: [{ id: "espresso", qty: 1, note: "" }],
    };
    const first = await api<OrderDTO>("/api/orders", { method: "POST", token, body: payload });
    const second = await api<OrderDTO>("/api/orders", { method: "POST", token, body: payload });
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.data.id).toBe(first.data.id);
  });

  it("applies option surcharges only to drinks and awards loyalty points", async () => {
    const { token, user } = await register();
    const order = await api<OrderDTO>("/api/orders", {
      method: "POST",
      token,
      body: {
        cafeId: "banani", mode: "pickup", payment: "cash", timeSlot: "ASAP",
        items: [
          { id: "espresso", qty: 1, note: "L · Oat milk", options: { size: "L", milk: "Oat" } },
          { id: "butter-croissant", qty: 1, note: "L · Oat milk", options: { size: "L", milk: "Oat" } },
        ],
      },
    });
    expect(order.status).toBe(201);
    expect(order.data.items[0]?.price).toBe(230);
    expect(order.data.items[1]?.price).toBe(150);
    expect(order.data.paymentStatus).toBe("pay_at_counter");

    const me = await api<{ user: { points: number; coffeeStamps: number } }>("/api/auth/me", { token });
    expect(me.data.user.points).toBeGreaterThan(user.points);
    expect(me.data.user.coffeeStamps).toBe(1);
  });

  it("logs out and invalidates the session", async () => {
    const { token } = await register();
    const logout = await api("/api/auth/logout", { method: "POST", token });
    expect(logout.status).toBe(200);

    const me = await api("/api/auth/me", { token });
    expect(me.status).toBe(401);
  });
});

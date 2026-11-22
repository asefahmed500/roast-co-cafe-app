import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { createMiddleware } from "hono/factory";
import type {
  AuthResponse,
  CafeDTO,
  CartDTO,
  CartLineInput,
  MenuItemDTO,
  OrderDTO,
  PromoDTO,
  UserDTO,
} from "../../shared/types";
import { createOrderSchema, loginSchema, cartSchema, registerSchema } from "../../shared/validation";
import { bearerToken, createSession, destroySession, hashPassword, userFromToken, verifyPassword } from "./lib/auth";
import { all, first, run, type MenuRow, type OrderRow, type UserRow } from "./lib/db";
import { ApiError, errors, parseOrThrow } from "./lib/errors";
import { createOrder, normalizeCartLines, toOrderDTO } from "./lib/orders";
import { allow } from "./lib/rate-limit";

type Variables = { user: UserRow | null };
type AppEnv = { Bindings: CloudflareBindings; Variables: Variables };

const app = new Hono<AppEnv>();

const toUserDTO = (user: UserRow): UserDTO => ({
  id: user.id,
  email: user.email,
  name: user.name,
  points: user.points,
  tier: user.tier,
  coffeeStamps: user.coffee_stamps,
});

const toMenuDTO = (row: MenuRow): MenuItemDTO => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  illustration: row.illustration as MenuItemDTO["illustration"],
  category: row.category as MenuItemDTO["category"],
  rating: row.rating,
  reviews: row.reviews,
  minutes: row.minutes,
  tint: row.tint,
});

const clientIp = (c: { req: { header: (name: string) => string | undefined } }) =>
  c.req.header("CF-Connecting-IP") ?? c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ?? "unknown";

/** Malformed JSON is a client error, never a 500. */
async function jsonBody(c: { req: { json: () => Promise<unknown> } }): Promise<unknown> {
  try {
    return await c.req.json();
  } catch {
    throw errors.badRequest("Malformed JSON body");
  }
}

/* ----------------------------- middleware ----------------------------- */

app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const url = new URL(c.req.url);
  console.log(JSON.stringify({
    message: "request",
    method: c.req.method,
    path: url.pathname,
    status: c.res.status,
    ms: Date.now() - start,
  }));
});

app.use("/api/*", secureHeaders());
app.use("/api/*", cors({
  origin: (origin, c) => {
    const configured = c.env.ALLOWED_ORIGIN ?? "*";
    if (configured === "*") return "*";
    const allowed = configured.split(",").map((value: string) => value.trim());
    return origin && allowed.includes(origin) ? origin : (allowed[0] ?? "*");
  },
  allowHeaders: ["Content-Type", "Authorization", "CF-Connecting-IP"],
  allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  maxAge: 86_400,
}));

const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const token = bearerToken(c.req.header("Authorization"));
  if (!token) throw errors.unauthorized();
  const user = await userFromToken(c.env.DB, token);
  if (!user) throw errors.unauthorized("Your session has expired. Please sign in again.");
  c.set("user", user);
  await next();
});

/* -------------------------------- routes ------------------------------- */

app.get("/api/health", (c) =>
  c.json({ ok: true, service: "roast-co-api", now: new Date().toISOString() }),
);

app.post("/api/auth/register", async (c) => {
  if (!(await allow(c.env.DB, `register:${clientIp(c)}`, 8, 3_600_000))) throw errors.tooMany();
  const input = parseOrThrow(registerSchema, await jsonBody(c));
  const email = input.email.toLowerCase().trim();
  const existing = await first<UserRow>(c.env.DB, "SELECT id FROM users WHERE email = ?", [email]);
  if (existing) throw errors.conflict("An account with this email already exists");

  const id = crypto.randomUUID();
  await run(
    c.env.DB,
    `INSERT INTO users (id, email, name, password_hash, points, tier, coffee_stamps, created_at)
     VALUES (?, ?, ?, ?, 0, 'Bronze', 0, ?)`,
    [id, email, input.name, await hashPassword(input.password), new Date().toISOString()],
  );
  const token = await createSession(c.env.DB, id, Number(c.env.SESSION_TTL_DAYS ?? 7));
  const user = await first<UserRow>(c.env.DB, "SELECT * FROM users WHERE id = ?", [id]);
  return c.json<AuthResponse>({ token, user: toUserDTO(user!) }, 201);
});

app.post("/api/auth/login", async (c) => {
  if (!(await allow(c.env.DB, `login:${clientIp(c)}`, 10, 900_000))) throw errors.tooMany();
  const input = parseOrThrow(loginSchema, await jsonBody(c));
  const user = await first<UserRow>(c.env.DB, "SELECT * FROM users WHERE email = ?", [
    input.email.toLowerCase().trim(),
  ]);
  // Always run the expensive check so missing users don't leak via timing.
  const valid = await verifyPassword(input.password, user?.password_hash ?? "$invalid$0$$");
  if (!user || !valid) throw errors.unauthorized("Email or password is incorrect");

  const token = await createSession(c.env.DB, user.id, Number(c.env.SESSION_TTL_DAYS ?? 7));
  return c.json<AuthResponse>({ token, user: toUserDTO(user) });
});

app.get("/api/auth/me", requireAuth, (c) =>
  c.json<{ user: UserDTO }>({ user: toUserDTO(c.get("user")!) }),
);

app.post("/api/auth/logout", requireAuth, async (c) => {
  const token = bearerToken(c.req.header("Authorization"))!;
  await destroySession(c.env.DB, token);
  return c.json({ ok: true });
});

app.get("/api/menu", async (c) => {
  const category = c.req.query("category");
  const rows = category
    ? await all<MenuRow>(
        c.env.DB,
        "SELECT * FROM menu_items WHERE active = 1 AND category = ? ORDER BY sort_order",
        [category],
      )
    : await all<MenuRow>(c.env.DB, "SELECT * FROM menu_items WHERE active = 1 ORDER BY sort_order");
  return c.json<{ items: MenuItemDTO[] }>({ items: rows.map(toMenuDTO) });
});

app.get("/api/menu/:id", async (c) => {
  const row = await first<MenuRow>(c.env.DB, "SELECT * FROM menu_items WHERE id = ? AND active = 1", [
    c.req.param("id"),
  ]);
  if (!row) throw errors.notFound("Menu item not found");
  return c.json<{ item: MenuItemDTO }>({ item: toMenuDTO(row) });
});

app.get("/api/cafes", async (c) => {
  const rows = await all<CafeDTO>(
    c.env.DB,
    "SELECT id, name, address, distance, tint FROM cafes ORDER BY sort_order",
  );
  return c.json<{ cafes: CafeDTO[] }>({ cafes: rows });
});

app.get("/api/promos/:code", async (c) => {
  const promo = await first<PromoDTO>(
    c.env.DB,
    "SELECT code, percent FROM promos WHERE code = ? AND active = 1",
    [c.req.param("code").toUpperCase()],
  );
  if (!promo) throw errors.notFound("That promo code is not valid");
  return c.json<{ promo: PromoDTO }>({ promo });
});

app.get("/api/cart", requireAuth, async (c) => {
  const row = await first<{ data: string; updated_at: string; promo_code: string | null }>(
    c.env.DB,
    "SELECT data, updated_at, promo_code FROM carts WHERE user_id = ?",
    [c.get("user")!.id],
  );
  let lines: CartLineInput[] = [];
  try { lines = row ? (JSON.parse(row.data) as CartLineInput[]) : []; } catch { lines = []; }
  const payload: CartDTO = {
    lines,
    promoCode: row?.promo_code ?? null,
    updatedAt: row?.updated_at ?? null,
  };
  return c.json<CartDTO>(payload);
});

app.put("/api/cart", requireAuth, async (c) => {
  if (!(await allow(c.env.DB, `cart:${c.get("user")!.id}`, 120, 3_600_000))) throw errors.tooMany();
  const input = parseOrThrow(cartSchema, await jsonBody(c));
  const lines = normalizeCartLines(input.lines);
  const promoCode = input.promoCode ?? null;
  const updatedAt = new Date().toISOString();
  await run(
    c.env.DB,
    `INSERT INTO carts (user_id, data, promo_code, updated_at) VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, promo_code = excluded.promo_code, updated_at = excluded.updated_at`,
    [c.get("user")!.id, JSON.stringify(lines), promoCode, updatedAt],
  );
  return c.json<CartDTO>({ lines, promoCode, updatedAt });
});

app.post("/api/orders", requireAuth, async (c) => {
  if (!(await allow(c.env.DB, `order:${c.get("user")!.id}`, 20, 3_600_000))) throw errors.tooMany();
  const input = parseOrThrow(createOrderSchema, await jsonBody(c));
  if (input.idempotencyKey) {
    const existing = await first<OrderRow>(
      c.env.DB,
      "SELECT * FROM orders WHERE idempotency_key = ? AND user_id = ?",
      [input.idempotencyKey, c.get("user")!.id],
    );
    if (existing) return c.json<OrderDTO>(toOrderDTO(existing), 200);
  }
  const order = await createOrder(c.env.DB, c.get("user")!.id, input);
  return c.json<OrderDTO>(order, 201);
});

app.get("/api/orders", requireAuth, async (c) => {
  const limit = Math.min(50, Math.max(1, Number(c.req.query("limit") ?? 50) || 50));
  const rows = await all<OrderRow>(
    c.env.DB,
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [c.get("user")!.id, limit],
  );
  return c.json<{ orders: OrderDTO[] }>({ orders: rows.map(toOrderDTO) });
});

app.get("/api/orders/:id", requireAuth, async (c) => {
  const row = await first<OrderRow>(c.env.DB, "SELECT * FROM orders WHERE id = ?", [c.req.param("id")]);
  if (!row || row.user_id !== c.get("user")!.id) throw errors.notFound("Order not found");
  return c.json<{ order: OrderDTO }>({ order: toOrderDTO(row) });
});

/* ---------------------------- error handling --------------------------- */

app.notFound((c) =>
  c.json({ error: { code: "NOT_FOUND", message: "Endpoint not found" } }, 404),
);

app.onError((err, c) => {
  if (err instanceof ApiError) {
    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          ...(err.issues ? { issues: err.issues } : {}),
        },
      },
      err.status as 400,
    );
  }
  console.error(JSON.stringify({
    message: "unhandled error",
    error: err instanceof Error ? err.message : String(err),
    path: new URL(c.req.url).pathname,
  }));
  return c.json({ error: { code: "INTERNAL", message: "Something went wrong on our end" } }, 500);
});

export default app;
